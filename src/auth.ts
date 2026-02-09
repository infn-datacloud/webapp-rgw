// SPDX-FileCopyrightText: 2025 Istituto Nazionale di Fisica Nucleare
//
// SPDX-License-Identifier: EUPL-1.2

import { betterAuth } from "better-auth";
import { settings } from "./config";
import { genericOAuth } from "better-auth/plugins";
import { nextCookies } from "better-auth/next-js";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { decodeJwtPayload } from "./commons/utils";
import { loginWithSTS } from "./services/s3/actions";

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
  plugins: [oAuth, nextCookies()],
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
