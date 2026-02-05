// SPDX-FileCopyrightText: 2025 Istituto Nazionale di Fisica Nucleare
//
// SPDX-License-Identifier: EUPL-1.2

"use server";

import { auth } from "@/auth";
import { settings } from "@/config";
import { S3ClientConfig } from "@aws-sdk/client-s3";
import { AwsCredentialIdentity } from "@aws-sdk/types";
import { AWSConfig } from "./types";
import {
  AssumeRoleWithWebIdentityCommand,
  STSClient,
} from "@aws-sdk/client-sts";
import { trace } from "@opentelemetry/api";
import { S3Service } from ".";

const {
  WEBAPP_RGW_S3_ENDPOINT,
  WEBAPP_RGW_S3_REGION,
  WEBAPP_RGW_S3_ROLE_ARN,
  WEBAPP_RGW_S3_ROLE_DURATION_SECONDS,
} = settings;

const tracer = trace.getTracer("s3webui");

export async function loginWithSTS(
  access_token: string
): Promise<AwsCredentialIdentity> {
  const config: AWSConfig = {
    endpoint: WEBAPP_RGW_S3_ENDPOINT,
    region: WEBAPP_RGW_S3_REGION,
    roleArn: WEBAPP_RGW_S3_ROLE_ARN,
    roleSessionDurationSeconds: parseInt(WEBAPP_RGW_S3_ROLE_DURATION_SECONDS),
  };
  const sts = new STSClient({ ...config });
  const command = new AssumeRoleWithWebIdentityCommand({
    DurationSeconds: config.roleSessionDurationSeconds,
    RoleArn: config.roleArn,
    RoleSessionName: crypto.randomUUID(),
    WebIdentityToken: access_token,
  });
  return await tracer.startActiveSpan("loginWithSTS", async span => {
    try {
      const response = await sts.send(command);
      const credentials = response.Credentials!;
      return {
        accessKeyId: credentials.AccessKeyId!,
        secretAccessKey: credentials.SecretAccessKey!,
        sessionToken: credentials.SessionToken!,
        expiration: credentials.Expiration,
      };
    } finally {
      span.end();
    }
  });
}

export async function s3ClientConfig(
  credentials: AwsCredentialIdentity
): Promise<S3ClientConfig> {
  let { expiration } = credentials;
  if (expiration && !(expiration instanceof Date)) {
    expiration = new Date(expiration);
  }

  const creds = { ...credentials, expiration };

  return {
    endpoint: WEBAPP_RGW_S3_ENDPOINT,
    region: WEBAPP_RGW_S3_REGION,
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
