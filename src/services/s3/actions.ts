// SPDX-FileCopyrightText: 2025 Istituto Nazionale di Fisica Nucleare
//
// SPDX-License-Identifier: EUPL-1.2

"use server";

import { getSession, Session } from "@/auth";
import { settings } from "@/config";
import { AwsCredentialIdentity } from "@aws-sdk/types";
import { AWSConfig, S3ServiceConfig } from "./types";
import {
  AssumeRoleWithWebIdentityCommand,
  STSClient,
} from "@aws-sdk/client-sts";
import { trace } from "@opentelemetry/api";
import { redirect } from "next/navigation";

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
    roleSessionDurationSeconds: WEBAPP_RGW_S3_ROLE_DURATION_SECONDS,
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

export async function getS3ServiceConfig(
  session?: Session
): Promise<S3ServiceConfig> {
  // optimization to avoid calling getSession() twice from SSR pages
  const _session = session ?? (await getSession());
  if (!_session) {
    throw Error("Cannot get S3 configuration: session not available");
  }
  // prettier-ignore
  const {
    accessKeyId,
    secretAccessKey,
    sessionToken,
    groups,
  } = _session.user;

  const credentials = { accessKeyId, secretAccessKey, sessionToken };
  return {
    s3ClientConfig: {
      endpoint: WEBAPP_RGW_S3_ENDPOINT,
      region: WEBAPP_RGW_S3_REGION,
      forcePathStyle: true,
      credentials,
    },
    publisherBucket: "bucket-policy",
    groups,
  };
}
