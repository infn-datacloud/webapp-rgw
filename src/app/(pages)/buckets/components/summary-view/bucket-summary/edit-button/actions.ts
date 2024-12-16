"use server";
import { parseS3Error } from "@/commons/utils";
import { BucketConfiguration } from "@/models/bucket";
import { makeS3Client } from "@/services/s3/actions";

export async function setBucketConfiguration(
  bucket: string,
  config: BucketConfiguration
) {
  const s3 = await makeS3Client();
  const { versioning, objectLock } = config;
  try {
    await Promise.all([
      s3.setBucketVersioning(bucket, versioning),
      // s3.setBucketObjectLock(bucket, objectLock),
    ]);
  } catch (err) {
    return parseS3Error(err);
  }
}
