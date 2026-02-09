// SPDX-FileCopyrightText: 2025 Istituto Nazionale di Fisica Nucleare
//
// SPDX-License-Identifier: EUPL-1.2

"use server";

import { parseS3Error } from "@/commons/utils";
import { S3Service } from "@/services/s3";
import { getS3ServiceConfig } from "@/services/s3/actions";

export async function setBucketVersioning(bucket: string, enabled: boolean) {
  try {
    const s3Config = await getS3ServiceConfig();
    const s3 = new S3Service(s3Config);
    await s3.setBucketVersioning(bucket, enabled);
    return {};
  } catch (err) {
    return { error: parseS3Error(err) };
  }
}

export async function setBucketObjectLock(bucket: string, enabled: boolean) {
  try {
    const s3Config = await getS3ServiceConfig();
    const s3 = new S3Service(s3Config);
    await s3.setBucketObjectLock(bucket, enabled);
    return {};
  } catch (err) {
    return { error: parseS3Error(err) };
  }
}
