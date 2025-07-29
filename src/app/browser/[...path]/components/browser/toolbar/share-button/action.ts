// SPDX-FileCopyrightText: 2025 Istituto Nazionale di Fisica Nucleare
//
// SPDX-License-Identifier: EUPL-1.2

"use server";

import { makeS3Client } from "@/services/s3/actions";

export async function getPresignedUrl(
  bucket: string,
  key: string,
  expiresIn: number
) {
  const s3 = await makeS3Client();
  return await s3.getPresignedUrl(bucket, key, expiresIn);
}
