"use server";
import { auth } from "@/auth";
import { S3ClientConfig } from "@aws-sdk/client-s3";
import { AwsCredentialIdentity } from "@aws-sdk/types";
import { S3Service } from ".";

export async function s3ClientConfig(
  credentials: AwsCredentialIdentity
): Promise<S3ClientConfig> {
  return {
    endpoint: process.env.S3_ENDPOINT!,
    region: process.env.S3_REGION!,
    credentials,
    forcePathStyle: true,
  };
}

export async function makeS3Client() {
  const session = await auth();
  if (!session) {
    throw Error("Session is not available");
  }
  const { credentials } = session;
  if (!credentials) {
    throw new Error("Cannot find credentials");
  }
  const s3Config = await s3ClientConfig(credentials);
  return new S3Service(s3Config);
}
