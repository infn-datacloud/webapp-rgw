// SPDX-FileCopyrightText: 2025 Istituto Nazionale di Fisica Nucleare
//
// SPDX-License-Identifier: EUPL-1.2

import type { Profile, User, Awaitable, TokenSet } from "@auth/core/types";
import NextAuth, { type NextAuthConfig } from "next-auth";
import type { DefaultJWT } from "next-auth/jwt";
import type { OIDCConfig } from "next-auth/providers";
import Credentials from "next-auth/providers/credentials";
import { AwsCredentialIdentity } from "@aws-sdk/types";
import { decodeJwtPayload } from "./commons/utils";
import { S3Service } from "./services/s3";

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    credentials?: AwsCredentialIdentity;
    groups?: string[];
  }
}

declare module "@auth/core/types" {
  interface User {
    credentials?: AwsCredentialIdentity;
  }

  interface Session {
    access_token?: string & DefaultSession["user"];
    credentials?: AwsCredentialIdentity;
    groups?: string[];
    error?: string;
  }
}

const IamProvider: OIDCConfig<Profile> = {
  id: "indigo-iam",
  name: "Indigo-IAM",
  type: "oidc",
  issuer: process.env.IAM_AUTHORITY_URL,
  clientId: process.env.IAM_CLIENT_ID,
  clientSecret: process.env.IAM_CLIENT_SECRET,
  authorization: {
    params: {
      scope: process.env.IAM_SCOPE,
      audience: process.env.IAM_AUDIENCE,
    },
  },
  checks: ["pkce", "state"],
  profile: (profile: Profile, _: TokenSet): Awaitable<User> => {
    const user: User = {
      id: profile.sub ?? undefined,
      name: profile.name ?? undefined,
      email: profile.email ?? undefined,
      image: profile.picture ?? undefined,
    };
    return user;
  },
};

const CredentialsProvider = Credentials({
  id: "credentials",
  credentials: {
    accessKeyId: { label: "Access Key Id" },
    secretAccessKey: { label: "Secret Access Key", type: "password" },
  },
  async authorize(credentials) {
    const accessKeyId = credentials.accessKeyId as string | undefined;
    const secretAccessKey = credentials.secretAccessKey as string | undefined;

    if (!accessKeyId || !secretAccessKey) {
      throw Error("Credentials not found");
    }

    const expires_in = process.env.S3_ROLE_DURATION_SECONDS
      ? parseInt(process.env.S3_ROLE_DURATION_SECONDS)
      : 600;
    const expiration = new Date(Date.now() + expires_in * 1000);

    return {
      id: accessKeyId,
      credentials: { accessKeyId, secretAccessKey, expiration },
    };
  },
});

export const authConfig: NextAuthConfig = {
  providers: [IamProvider, CredentialsProvider],
  pages: {
    signIn: "/login",
    error: "/error",
  },
  callbacks: {
    async jwt({ token, account, user }) {
      if (!account) {
        return token;
      }
      const { access_token } = account;
      if (access_token) {
        const groups = decodeJwtPayload(access_token)["groups"] as
          | string[]
          | undefined;
        try {
          const credentials = await S3Service.loginWithSTS(access_token);
          token.credentials = credentials
          token.groups = groups;
        } catch (err) {
          console.error("Cannot perform STS AssumeRoleWithWebIdentity:", err);
          throw err;
        }
      } else if (user.credentials) {
        token.credentials = user.credentials;
      }
      return token;
    },
    authorized({ auth }) {
      const expiration = new Date(auth?.credentials?.expiration ?? 0);
      const now = new Date();
      const sessionExpired = expiration < now;
      return !!auth && !sessionExpired;
    },
    async session({ session, token }) {
      const { credentials, groups } = token;
      session.credentials = credentials;
      session.groups = groups;
      return session;
    },
  },
};

export const { auth, handlers, signIn, signOut } = NextAuth(authConfig);
