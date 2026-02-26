// SPDX-FileCopyrightText: 2025 Istituto Nazionale di Fisica Nucleare
//
// SPDX-License-Identifier: EUPL-1.2

import { betterAuth, BetterAuthOptions, BetterAuthPlugin } from "better-auth";
import { ERROR_CODES, genericOAuth } from "better-auth/plugins";
import { APIError } from "better-auth/api";
import { createAuthEndpoint } from "better-auth/api";
import { nextCookies } from "better-auth/next-js";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { settings } from "@/config";
import { decodeJwtPayload } from "./commons/utils";
import { listBuckets, loginWithSTS } from "./services/s3/actions";
import { setSessionCookie } from "better-auth/cookies";
import { Database } from "better-sqlite3";
import z from "zod";

const {
  WEBAPP_RGW_BASE_URL,
  WEBAPP_RGW_AUTH_SECRET,
  WEBAPP_RGW_OIDC_ISSUER,
  WEBAPP_RGW_OIDC_CLIENT_ID,
  WEBAPP_RGW_OIDC_CLIENT_SECRET,
  WEBAPP_RGW_OIDC_SCOPE,
  WEBAPP_RGW_OIDC_AUDIENCE,
  WEBAPP_RGW_S3_ROLE_DURATION_SECONDS,
} = settings;

// https://github.com/better-auth/better-auth/blob/dfeefc4f58ee24f1ee6cdbe22d5e720b2ba621b8/packages/better-auth/src/plugins/username/index.ts#L98
const accessKeysSchema = z.object({
  accessKeyId: z.string().meta({ description: "Access Key Id" }),
  secretAccessKey: z.string().meta({ description: "Secret Access Key" }),
});

function plainCredentials() {
  return {
    id: "credentials",
    schema: {
      credentials: {
        fields: {
          accessKeyId: {
            type: "string",
          },
          secretAccessKey: {
            type: "string",
          },
        },
      },
    },
    endpoints: {
      signInCredentials: createAuthEndpoint(
        "/sign-in/credentials",
        {
          method: "POST",
          body: accessKeysSchema,
        },
        async ctx => {
          const { accessKeyId, secretAccessKey } = ctx.body;
          if (!accessKeyId || !secretAccessKey) {
            throw new APIError("UNAUTHORIZED", {
              message: ERROR_CODES.INVALID_API_KEY,
            });
          }
          const maybeUser =
            await ctx.context.internalAdapter.findUserById(accessKeyId);

          const user =
            maybeUser ??
            (await ctx.context.internalAdapter.createUser({
              id: accessKeyId,
              name: accessKeyId,
              createdAt: new Date(),
              updatedAt: new Date(),
              emailVerified: false,
              email: accessKeyId,
            }));
          const session = await ctx.context.internalAdapter.createSession(
            accessKeyId,
            false
          );
          await setSessionCookie(ctx, { session, user });
          return ctx.json({
            token: session.token,
            user,
          });
        }
      ),
    },
  } satisfies BetterAuthPlugin;
}

const oAuth = () =>
  genericOAuth({
    config: [
      {
        providerId: "indigo-iam",
        discoveryUrl: `${WEBAPP_RGW_OIDC_ISSUER}/.well-known/openid-configuration`,
        clientId: WEBAPP_RGW_OIDC_CLIENT_ID,
        clientSecret: WEBAPP_RGW_OIDC_CLIENT_SECRET,
        scopes: WEBAPP_RGW_OIDC_SCOPE.split(" "),
        pkce: true,
        authorizationUrlParams: {
          aud: WEBAPP_RGW_OIDC_AUDIENCE,
        },
      },
    ],
  });

export const authConfig = (db: Database) => {
  return {
    baseURL: `${WEBAPP_RGW_BASE_URL}/api/auth`,
    secret: WEBAPP_RGW_AUTH_SECRET,
    database: db,
    session: {
      // expire 1 seconds before aws credentials
      expiresIn: WEBAPP_RGW_S3_ROLE_DURATION_SECONDS - 1,
      disableSessionRefresh: true,
      additionalFields: {
        accessKeyId: {
          type: "string",
        },
        secretAccessKey: {
          type: "string",
        },
        sessionToken: {
          type: "string",
          defaultValue: null,
        },
        groups: {
          type: "string[]",
        },
      },
    },
    databaseHooks: {
      session: {
        create: {
          before: async (sessionData, ctx) => {
            if (!ctx) {
              throw new APIError("UNAUTHORIZED", {
                message: ERROR_CODES.UNAUTHORIZED_SESSION,
              });
            }
            if (ctx.path === "/oauth2/callback/:providerId") {
              const { userId } = sessionData;
              // prettier-ignore
              const [account] = await ctx.context
                                         .internalAdapter
                                         .findAccountByUserId(userId);
              const { accessToken } = account;
              if (!accessToken) {
                throw new Error("cannot perform STS: access token not found");
              }
              const profile = decodeJwtPayload(accessToken);
              const credentials = await loginWithSTS(accessToken);
              // prettier-ignore
              const {
                  accessKeyId,
                  secretAccessKey,
                  sessionToken,
                } = credentials;
              if (!(accessKeyId && secretAccessKey && sessionToken)) {
                throw new Error("Failed to get AWS Credentials");
              }
              const groups = profile["groups"] ?? [];
              return {
                data: {
                  ...sessionData,
                  accessKeyId,
                  secretAccessKey,
                  sessionToken,
                  groups,
                },
              };
            } else if (ctx.path === "/sign-in/credentials") {
              const { accessKeyId, secretAccessKey } = ctx.body;
              try {
                await listBuckets({ accessKeyId, secretAccessKey });
              } catch (err) {
                if (err instanceof Error) {
                  if (err.name === "AccessDenied") {
                    throw new APIError("FORBIDDEN", {
                      message: ERROR_CODES.UNAUTHORIZED_SESSION,
                    });
                  }
                  throw err;
                } else {
                  throw new Error(`Unknown error: ${err}`);
                }
              }
              return {
                data: {
                  ...sessionData,
                  accessKeyId,
                  secretAccessKey,
                  sessionToken: "",
                  groups: [],
                },
              };
            }
            return { data: { ...sessionData } };
          },
        },
      },
    },
    account: {
      updateAccountOnSignIn: true,
    },
    plugins: [oAuth(), plainCredentials(), nextCookies()],
  } satisfies BetterAuthOptions;
};

export const auth = betterAuth(authConfig(globalThis.db));
export type User = typeof auth.$Infer.Session.user;
export type Session = typeof auth.$Infer.Session;

export async function signInCredentials(
  accessKeyId: string,
  secretAccessKey: string
) {
  try {
    await auth.api.signInCredentials({
      body: { accessKeyId, secretAccessKey },
    });
    redirect("/");
  } catch (err) {
    if (err instanceof APIError) {
      redirect(`/login?error=${err.status}`);
    }
    throw err;
  }
}

export async function signIn() {
  const { url } = await auth.api.signInWithOAuth2({
    body: {
      providerId: "indigo-iam",
      callbackURL: WEBAPP_RGW_BASE_URL,
    },
  });
  redirect(url);
}

export async function signOut() {
  await auth.api.signOut({ headers: await headers() });
}

export async function getSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  return session;
}

export async function getAccessToken() {
  return await auth.api.getAccessToken({
    body: {
      providerId: "indigo-iam",
    },
    headers: await headers(),
  });
}
