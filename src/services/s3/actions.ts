// SPDX-FileCopyrightText: 2025 Istituto Nazionale di Fisica Nucleare
//
// SPDX-License-Identifier: EUPL-1.2

"use server";

import { getSession, Session } from "@/auth";
import { settings } from "@/config";
import { S3ServiceConfig } from "./types";
import { S3Service } from ".";

const { WEBAPP_RGW_S3_ENDPOINT, WEBAPP_RGW_S3_REGION } = settings;

export async function listBuckets(credentials: {
  accessKeyId: string;
  secretAccessKey: string;
}) {
  const s3 = new S3Service({
    s3ClientConfig: {
      endpoint: WEBAPP_RGW_S3_ENDPOINT,
      region: WEBAPP_RGW_S3_REGION,
      forcePathStyle: true,
      credentials,
    },
  });
  return await s3.fetchPrivateBuckets();
}

export async function getS3ServiceConfig(
  session?: Session
): Promise<S3ServiceConfig> {
  // optimization to avoid calling getSession() twice from SSR pages
  const _session = session ?? (await getSession());
  if (!_session) {
    throw new Error("session not found");
  }
  // prettier-ignore
  const {
    accessKeyId,
    secretAccessKey,
    sessionToken,
    groups,
  } = _session.session;

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
