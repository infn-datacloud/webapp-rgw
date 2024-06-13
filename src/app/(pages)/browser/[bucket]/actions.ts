"use server";

import { parseS3Error } from "@/commons/utils";
import { makeS3Client } from "@/services/s3/actions";

export async function getPresignedUrlsMap(bucket: string, keys: string[]) {
  const s3 = await makeS3Client();
  const promises = keys.map(o => s3.getPresignedUrl(bucket, o));
  const urls = await Promise.all(promises);
  return urls.map((url, i) => {
    return { key: keys[i], url: url };
  });
}

export async function deleteObjects(bucket: string, keys: string[]) {
  const s3 = await makeS3Client();
  const promises = keys.map(o => s3.deleteObject(bucket, o));
  try {
    await Promise.all(promises);
  } catch (err) {
    return parseS3Error(err);
  }
}
