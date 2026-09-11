// SPDX-FileCopyrightText: 2026 Istituto Nazionale di Fisica Nucleare
//
// SPDX-License-Identifier: EUPL-1.2

"use server";

import { AwsCredentialIdentity } from "@aws-sdk/types";
import {
  AssumeRoleWithWebIdentityCommand,
  STSClient,
} from "@aws-sdk/client-sts";
import { trace } from "@opentelemetry/api";

import { settings } from "@/config";

const tracer = trace.getTracer("s3webui");

const {
  WEBAPP_RGW_S3_ENDPOINT,
  WEBAPP_RGW_S3_REGION,
  WEBAPP_RGW_S3_ROLE_ARN,
  WEBAPP_RGW_S3_ROLE_DURATION_SECONDS,
} = settings;

export async function assumeRoleWithWebIdentity(
  access_token: string,
  duration?: number
): Promise<AwsCredentialIdentity> {
  const config = {
    endpoint: WEBAPP_RGW_S3_ENDPOINT,
    region: WEBAPP_RGW_S3_REGION,
    roleArn: WEBAPP_RGW_S3_ROLE_ARN,
    roleSessionDurationSeconds: duration ?? WEBAPP_RGW_S3_ROLE_DURATION_SECONDS,
  };
  const sts = new STSClient({ ...config });
  const command = new AssumeRoleWithWebIdentityCommand({
    DurationSeconds: config.roleSessionDurationSeconds,
    RoleArn: config.roleArn,
    RoleSessionName: crypto.randomUUID(),
    WebIdentityToken: access_token,
  });
  return await tracer.startActiveSpan(
    "assumeRoleWithWebIdentity",
    async span => {
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
    }
  );
}
