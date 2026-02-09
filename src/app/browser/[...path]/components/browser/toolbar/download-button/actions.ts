// SPDX-FileCopyrightText: 2025 Istituto Nazionale di Fisica Nucleare
//
// SPDX-License-Identifier: EUPL-1.2

"use server";

import { S3Service } from "@/services/s3";
import { getS3ServiceConfig } from "@/services/s3/actions";

export async function getPresignedUrlsMap(bucket: string, keys: string[]) {
  const s3Config = await getS3ServiceConfig();
  const s3 = new S3Service(s3Config);
  const promises = keys.map(o => s3.getPresignedUrl(bucket, o));
  const urls = await Promise.all(promises);
  return urls.map((url, i) => {
    return { key: keys[i], url: url };
  });
}
