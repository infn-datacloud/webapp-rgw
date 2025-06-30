// SPDX-FileCopyrightText: 2025 Istituto Nazionale di Fisica Nucleare
//
// SPDX-License-Identifier: EUPL-1.2

"use server";
import { makeS3Client } from "@/services/s3/actions";

export async function getPresignedUrlsMap(bucket: string, keys: string[]) {
  const s3 = await makeS3Client();
  const promises = keys.map(o => s3.getPresignedUrl(bucket, o));
  const urls = await Promise.all(promises);
  return urls.map((url, i) => {
    return { key: keys[i], url: url };
  });
}
