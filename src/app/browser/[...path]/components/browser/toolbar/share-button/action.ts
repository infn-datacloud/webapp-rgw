// SPDX-FileCopyrightText: 2025 Istituto Nazionale di Fisica Nucleare
//
// SPDX-License-Identifier: EUPL-1.2

"use server";

import { S3Service } from "@/services/s3";
import { getS3ServiceConfig } from "@/services/s3/actions";

export async function getPresignedUrl(
  bucket: string,
  key: string,
  expiresIn: number
) {
  const s3Config = await getS3ServiceConfig();
  const s3 = new S3Service(s3Config);
  return await s3.getPresignedUrl(bucket, key, expiresIn);
}
