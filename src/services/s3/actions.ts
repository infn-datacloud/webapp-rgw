// SPDX-FileCopyrightText: 2025 Istituto Nazionale di Fisica Nucleare
//
// SPDX-License-Identifier: EUPL-1.2

"use server";

import { auth } from "@/auth";
import { S3ClientConfig } from "@aws-sdk/client-s3";
import { AwsCredentialIdentity } from "@aws-sdk/types";
import { S3Service } from ".";

export async function s3ClientConfig(
  credentials: AwsCredentialIdentity
): Promise<S3ClientConfig> {
  let { expiration } = credentials;
  if (expiration && !(expiration instanceof Date)) {
    expiration = new Date(expiration);
  }

  const creds = { ...credentials, expiration };

  return {
    endpoint: process.env.S3_ENDPOINT!,
    region: process.env.S3_REGION!,
    credentials: creds,
    forcePathStyle: true,
  };
}

export async function makeS3Client() {
  const session = await auth();
  if (!session) {
    throw Error("Session is not available");
  }
  const { credentials, groups } = session;
  if (!credentials) {
    throw new Error("Cannot find credentials");
  }

  const s3Config = await s3ClientConfig(credentials);
  return new S3Service(s3Config, "bucket-policy", groups);
}
