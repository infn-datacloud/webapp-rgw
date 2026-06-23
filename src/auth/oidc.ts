// SPDX-FileCopyrightText: 2026 Istituto Nazionale di Fisica Nucleare
//
// SPDX-License-Identifier: EUPL-1.2

import { decodeJwtPayload } from "@/commons/utils";
import { settings } from "@/config";
import { loginWithSTS } from "@/services/s3/actions";
import { GenericEndpointContext } from "better-auth";
import { genericOAuth } from "better-auth/plugins";

const {
  WEBAPP_RGW_OIDC_ISSUER,
  WEBAPP_RGW_OIDC_CLIENT_ID,
  WEBAPP_RGW_OIDC_CLIENT_SECRET,
  WEBAPP_RGW_OIDC_SCOPE,
  WEBAPP_RGW_OIDC_AUDIENCE,
} = settings;

export const oAuth2ProviderEnabled =
  WEBAPP_RGW_OIDC_ISSUER &&
  WEBAPP_RGW_OIDC_CLIENT_ID &&
  WEBAPP_RGW_OIDC_CLIENT_SECRET &&
  WEBAPP_RGW_OIDC_SCOPE &&
  WEBAPP_RGW_OIDC_AUDIENCE;

if (oAuth2ProviderEnabled) {
  console.log("OAuth2 provider enabled.");
}

export function oAuthProvider() {
  return genericOAuth({
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
}

type SessionData = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  expiresAt: Date;
  token: string;
  ipAddress?: string | null | undefined;
  userAgent?: string | null | undefined;
};

export async function getOAuth2Session(
  sessionData: SessionData,
  ctx: GenericEndpointContext
) {
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
}
