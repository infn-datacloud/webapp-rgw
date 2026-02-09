// SPDX-FileCopyrightText: 2025 Istituto Nazionale di Fisica Nucleare
//
// SPDX-License-Identifier: EUPL-1.2

"use server";

import { BucketConfiguration } from "@/models/bucket";
import { S3Service } from "@/services/s3";
import { getS3ServiceConfig } from "@/services/s3/actions";

export async function getBucketConfiguration(
  bucket: string
): Promise<BucketConfiguration> {
  const s3Config = await getS3ServiceConfig();
  const s3 = new S3Service(s3Config);
  const [versioningOutput] = await Promise.all([
    s3.getBucketVersioning(bucket),
    // s3.getBucketObjectLock(bucket),
  ]);
  const versioning = versioningOutput.Status === "Enabled";
  // const objectLock =
  //   objectLockOutput.ObjectLockConfiguration?.ObjectLockEnabled === "Enabled";
  return { versioning, objectLock: false };
}
