"use server";
import { parseS3Error } from "@/commons/utils";
import { makeS3Client } from "@/services/s3/actions";

export async function setBucketVersioning(bucket: string, enabled: boolean) {
  try {
    const s3 = await makeS3Client();
    await s3.setBucketVersioning(bucket, enabled);
    return {};
  } catch (err) {
    return { error: parseS3Error(err) };
  }
}

export async function setBucketObjectLock(bucket: string, enabled: boolean) {
  try {
    const s3 = await makeS3Client();
    await s3.setBucketObjectLock(bucket, enabled);
    return {};
  } catch (err) {
    return { error: parseS3Error(err) };
  }
}
