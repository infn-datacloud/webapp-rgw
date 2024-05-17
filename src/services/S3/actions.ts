"use server";
import { S3ClientConfig } from "@aws-sdk/client-s3";
import { AwsCredentialIdentity } from "@aws-sdk/types";

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
