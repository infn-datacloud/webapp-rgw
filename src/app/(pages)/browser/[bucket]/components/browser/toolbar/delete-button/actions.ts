"use server";
import { parseS3Error } from "@/commons/utils";
import { makeS3Client } from "@/services/s3/actions";

export async function deleteObjects(bucket: string, keys: string[]) {
  const s3 = await makeS3Client();
  const promises = keys.map(o => s3.deleteObject(bucket, o));
  try {
    await Promise.all(promises);
  } catch (err) {
    return parseS3Error(err);
  }
}
