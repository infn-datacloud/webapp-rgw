// SPDX-FileCopyrightText: 2025 Istituto Nazionale di Fisica Nucleare
//
// SPDX-License-Identifier: EUPL-1.2

import { betterAuth, BetterAuthPlugin } from "better-auth";
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
          const session = await ctx.context.internalAdapter.createSession(
            accessKeyId,
            false
          );
          const expiration = new Date();
          expiration.setSeconds(
            expiration.getSeconds() + WEBAPP_RGW_S3_ROLE_DURATION_SECONDS
          );
          const user = {
            id: accessKeyId,
            name: accessKeyId,
            createdAt: new Date(),
            updatedAt: new Date(),
            expiration: expiration,
            emailVerified: false,
            email: "",
            accessKeyId,
            secretAccessKey,
          };
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

const oAuth = genericOAuth({
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
      getUserInfo: async ({ idToken, accessToken }) => {
        try {
          if (!idToken || !accessToken) {
            // returning null will raise an exception during the login flow
            return null;
          }
          const profile = decodeJwtPayload(accessToken);
          const groups = profile["groups"] as string[] | undefined;
          const credentials = await loginWithSTS(accessToken);
          const { accessKeyId, secretAccessKey, sessionToken } = credentials;
          if (!(accessKeyId && secretAccessKey && sessionToken)) {
            throw new Error("Failed to get AWS Credentials");
          }
          return {
            id: profile.sub,
            emailVerified: profile.email_verified ?? false,
            name: profile.name,
            email: profile.email,
            sub: profile.sub,
            groups: groups ? groups.join(" ") : "",
            ...credentials,
          };
        } catch (err) {
          if (err instanceof Error) {
            console.error(
              "An error occurred during STS token exchange:\n",
              JSON.stringify(err, null, 2)
            );
          } else {
            console.error("Uncaught exception during STS token exchange");
          }
          return null;
        }
      },
    },
  ],
});

export const auth = betterAuth({
  baseURL: `${WEBAPP_RGW_BASE_URL}/api/auth`,
  secret: WEBAPP_RGW_AUTH_SECRET,
  user: {
    additionalFields: {
      accessKeyId: {
        type: "string",
        required: true,
        defaultValue: false,
        input: false,
      },
      secretAccessKey: {
        type: "string",
        required: true,
        input: false,
      },
      sessionToken: {
        type: "string",
        required: true,
        input: false,
        defaultValue: undefined,
      },
      expiration: {
        type: "string",
        required: false,
        input: false,
        defaultValue: undefined,
      },
      groups: {
        type: "string",
        required: true,
        input: false,
        defaultValue: "",
      },
    },
  },
  plugins: [oAuth, plainCredentials(), nextCookies()],
  session: {
    expiresIn: WEBAPP_RGW_S3_ROLE_DURATION_SECONDS,
    disableSessionRefresh: true,
    cookieCache: {
      strategy: "jwe",
      enabled: true,
      maxAge: 3600,
    },
  },
  account: {
    storeStateStrategy: "cookie",
    storeAccountCookie: true, // Store account data after OAuth flow in a cookie (useful for database-less flows)
    updateAccountOnSignIn: true,
  },
});

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
  if (!session?.user.expiration) {
    return;
  }
  // Be pedantic with STS credentials expire date.
  // Since both user session and STS role have same duration in seconds,
  // STS role should not expire before user session (with temporal resolution
  // in seconds)
  if (new Date(session.user.expiration) < new Date()) {
    signOut();
    return;
  }
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
