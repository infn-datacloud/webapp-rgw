// SPDX-FileCopyrightText: 2025 Istituto Nazionale di Fisica Nucleare
//
// SPDX-License-Identifier: EUPL-1.2

"use server";

import { parseS3Error } from "@/commons/utils";
import { S3Service } from "@/services/s3";
import { getS3ServiceConfig } from "@/services/s3/actions";
import { revalidatePath } from "next/cache";

export async function deleteBucket(bucket: string) {
  try {
    const s3Config = await getS3ServiceConfig();
    const s3 = new S3Service(s3Config);
    await s3.deleteBucket(bucket);
    revalidatePath("/buckets");
  } catch (err) {
    return parseS3Error(err);
  }
}
