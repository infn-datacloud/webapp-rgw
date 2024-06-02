"use server";
import { BucketConfiguration } from "@/models/bucket";
import { makeS3Client } from "@/services/s3/actions";

export async function getBucketConfiguration(
  bucket: string
): Promise<BucketConfiguration> {
  const s3 = await makeS3Client();
  const [versioningOutput] = await Promise.all([
    s3.getBucketVersioning(bucket),
    // s3.getBucketObjectLock(bucket),
  ]);
  const versioning = versioningOutput.Status === "Enabled";
  // const objectLock =
  //   objectLockOutput.ObjectLockConfiguration?.ObjectLockEnabled === "Enabled";
  return { versioning, objectLock: false };
}

export async function setBucketConfiguration(
  bucket: string,
  config: BucketConfiguration
) {
  const s3 = await makeS3Client();
  const { versioning, objectLock } = config;
  await Promise.all([
    s3.setBucketVersioning(bucket, versioning),
    // s3.setBucketObjectLock(bucket, objectLock),
  ]);
}

export async function createBucket(formData: FormData) {
  const bucketName = formData.get("new-bucket") as string;
  const objectLockEnabled = formData.get("objectLock") === "on";
  const versioningEnabled = formData.get("versioningEnabled") === "on";

  if (!bucketName) {
    throw Error("bucket name is null");
  }
  const s3 = await makeS3Client();
  await s3.createBucket({ bucketName, objectLockEnabled, versioningEnabled });
}
