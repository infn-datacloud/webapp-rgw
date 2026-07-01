// SPDX-FileCopyrightText: 2026 Istituto Nazionale di Fisica Nucleare
//
// SPDX-License-Identifier: EUPL-1.2

import { listBuckets } from "@/services/s3/actions";
import { settings } from "@/config";
import { BetterAuthPlugin, GenericEndpointContext } from "better-auth";
import { createAuthEndpoint, APIError } from "better-auth/api";
import { setSessionCookie } from "better-auth/cookies";
import z from "zod";

const { WEBAPP_RGW_ENABLE_CREDENTIALS } = settings;

export const credentialsProviderEnabled = WEBAPP_RGW_ENABLE_CREDENTIALS;

const accessKeysSchema = z.object({
  accessKeyId: z.string().meta({ description: "Access Key Id" }),
  secretAccessKey: z.string().meta({ description: "Secret Access Key" }),
});

export function credentialsProvider() {
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
              message: "Access Key Id or Secret Access Key not found",
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

export async function getCredentialsSession(
  sessionData: SessionData,
  ctx: GenericEndpointContext
) {
  const { accessKeyId, secretAccessKey } = ctx.body;
  try {
    await listBuckets({ accessKeyId, secretAccessKey });
  } catch (err) {
    if (err instanceof Error) {
      if (err.name === "AccessDenied") {
        throw new APIError("FORBIDDEN", {
          message: "Access Denied",
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
