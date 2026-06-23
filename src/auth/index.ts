// SPDX-FileCopyrightText: 2025 Istituto Nazionale di Fisica Nucleare
//
// SPDX-License-Identifier: EUPL-1.2

import { betterAuth, BetterAuthOptions } from "better-auth";
import { APIError } from "better-auth/api";
import { nextCookies } from "better-auth/next-js";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { settings } from "@/config";
import { Database } from "better-sqlite3";
import { oAuth2ProviderEnabled, getOAuth2Session, oAuthProvider } from "./oidc";
import {
  getCredentialsSession,
  credentialsProvider,
  credentialsProviderEnabled,
} from "./plain-credentials";

export { oAuth2ProviderEnabled, credentialsProviderEnabled };

if (!oAuth2ProviderEnabled && !credentialsProviderEnabled) {
  throw new Error(
    "None of OAuth2 provider or credentials provider is enabled. Please review your configuration."
  );
}

const {
  WEBAPP_RGW_BASE_URL,
  WEBAPP_RGW_AUTH_SECRET,
  WEBAPP_RGW_S3_ROLE_DURATION_SECONDS,
} = settings;

// https://github.com/better-auth/better-auth/blob/dfeefc4f58ee24f1ee6cdbe22d5e720b2ba621b8/packages/better-auth/src/plugins/username/index.ts#L98

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
                message: "Context session not found",
              });
            }
            if (ctx.path === "/oauth2/callback/:providerId") {
              return getOAuth2Session(sessionData, ctx);
            } else if (ctx.path === "/sign-in/credentials") {
              return getCredentialsSession(sessionData, ctx);
            }
            return { data: { ...sessionData } };
          },
        },
      },
    },
    account: {
      updateAccountOnSignIn: true,
    },
    plugins: [oAuthProvider(), credentialsProvider(), nextCookies()],
  } satisfies BetterAuthOptions;
};

export const auth = betterAuth(authConfig(globalThis.db));
export type User = typeof auth.$Infer.Session.user;
export type Session = typeof auth.$Infer.Session;

export async function signInCredentials(
  accessKeyId: string,
  secretAccessKey: string
) {
  if (!credentialsProviderEnabled) {
    return;
  }
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
  if (!oAuth2ProviderEnabled) {
    return;
  }
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
