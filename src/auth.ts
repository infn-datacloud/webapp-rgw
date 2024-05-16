import NextAuth from "next-auth";
import type { DefaultSession, NextAuthConfig } from "next-auth";
import type { DefaultJWT } from "next-auth/jwt";
import type { Profile, User, Awaitable, TokenSet } from "@auth/core/types";
import type { OIDCConfig } from "next-auth/providers";
import { AwsCredentialIdentity } from "@aws-sdk/types";
import { S3Service } from "./services/s3";

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    credentials?: AwsCredentialIdentity;
  }
}

declare module "next-auth" {
  interface Session {
    access_token?: string & DefaultSession["user"];
    credentials?: AwsCredentialIdentity;
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
      scope: "openid email profile",
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

export const authConfig: NextAuthConfig = {
  providers: [IamProvider],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, account }) {
      if (!account) {
        return token;
      }
      const { access_token } = account;
      if (access_token) {
        token.credentials = await S3Service.loginWithSTS(access_token);
      }

      return token;
    },
    authorized({ auth }) {
      const isLoggedIn = !!auth?.user;
      return isLoggedIn;
    },

    async session({ session, token }) {
      const { credentials } = token;
      if (credentials) {
        session.credentials = token.credentials;
      }
      return session;
    },
  },
};

export const { auth, handlers, signIn, signOut } = NextAuth(authConfig);
