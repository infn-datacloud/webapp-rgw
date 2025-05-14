// SPDX-FileCopyrightText: 2025 Istituto Nazionale di Fisica Nucleare
//
// SPDX-License-Identifier: EUPL-1.2

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
