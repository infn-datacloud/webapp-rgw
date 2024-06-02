import NextAuth, { CredentialsSignin } from "next-auth";
import type { NextAuthConfig } from "next-auth";
import type { DefaultJWT } from "next-auth/jwt";
import type { Profile, User, Awaitable, TokenSet } from "@auth/core/types";
import type { OIDCConfig } from "next-auth/providers";
import { AwsCredentialIdentity } from "@aws-sdk/types";
import { S3Service } from "./services/s3";
import Credentials from "next-auth/providers/credentials";
import { s3ClientConfig } from "./services/s3/actions";

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    credentials?: AwsCredentialIdentity;
  }
}

declare module "@auth/core/types" {
  interface User {
    credentials?: AwsCredentialIdentity;
  }

  interface Session {
    access_token?: string & DefaultSession["user"];
    credentials?: AwsCredentialIdentity;
    error?: string;
  }
}

class AccessDenied extends CredentialsSignin {
  code = "Invalid credentials";
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

    try {
      const s3Config = await s3ClientConfig({ accessKeyId, secretAccessKey });
      const s3 = new S3Service(s3Config);
      await s3.fetchBucketList();
    } catch (err) {
      if (err instanceof Error && err.name === "AccessDenied") {
        throw new AccessDenied();
      }
      console.error(err);
      return null;
    }
    return {
      id: accessKeyId,
      credentials: { accessKeyId, secretAccessKey },
    };
  },
});

export const authConfig: NextAuthConfig = {
  providers: [IamProvider, CredentialsProvider],
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async jwt({ token, account, user }) {
      if (!account) {
        return token;
      }
      const { access_token } = account;
      if (access_token) {
        token.credentials = await S3Service.loginWithSTS(access_token);
      } else if (user.credentials) {
        token.credentials = user.credentials;
      }
      return token;
    },

    authorized({ auth }) {
      const isLoggedIn = !!auth?.user;
      return isLoggedIn;
    },

    async session({ session, token }) {
      const { credentials } = token;
      if (!credentials) {
        console.error("credentials not found");
        signOut();
        return session;
      }
      const { expiration } = credentials;
      if (expiration && new Date(expiration) < new Date()) {
        console.log("Session expired.");
        await signOut({ redirect: true });
      }
      session.credentials = credentials;
      return session;
    },
  },
};

export const { auth, handlers, signIn, signOut } = NextAuth(authConfig);
