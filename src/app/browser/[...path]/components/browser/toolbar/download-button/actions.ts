// SPDX-FileCopyrightText: 2025 Istituto Nazionale di Fisica Nucleare
//
// SPDX-License-Identifier: EUPL-1.2

"use server";

import { S3Service } from "@/services/s3";
import { getS3ServiceConfig } from "@/services/s3/actions";
import { settings } from "@/config";
import { getSession } from "@/auth";

const { WEBAPP_RGW_S3_ENDPOINT, WEBAPP_RGW_S3_REGION } = settings;

export async function getPresignedUrl(bucket: string, key: string) {
  const s3Config = await getS3ServiceConfig();
  const s3 = new S3Service(s3Config);
  return await s3.getPresignedUrl(bucket, key);
}

export async function generateCLICommand(
  bucket: string,
  keys: string[],
  prefixes: string[]
) {
  const session = await getSession();
  if (!session?.session) {
    throw new Error("Session not found");
  }
  const { accessKeyId, secretAccessKey, sessionToken } = session.session;

  const credentials = `export AWS_ACCESS_KEY_ID="${accessKeyId}"
export AWS_SECRET_ACCESS_KEY="${secretAccessKey}"
export AWS_SESSION_TOKEN="${sessionToken}"
export AWS_DEFAULT_REGION="${WEBAPP_RGW_S3_REGION}"
export AWS_ENDPOINT_URL_S3="${WEBAPP_RGW_S3_ENDPOINT}"\n
`;

  let command = "";
  for (const prefix of prefixes) {
    command += `aws s3 cp "s3://${bucket}/${prefix}" ./${prefix} --recursive \n`;
  }

  for (const key of keys) {
    command += `aws s3 cp "s3://${bucket}/${key}" . \n`;
  }

  return [credentials, command];
}
