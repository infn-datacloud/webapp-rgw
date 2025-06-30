// SPDX-FileCopyrightText: 2025 Istituto Nazionale di Fisica Nucleare
//
// SPDX-License-Identifier: EUPL-1.2

"use server";
import { parseS3Error } from "@/commons/utils";
import { makeS3Client } from "@/services/s3/actions";
import { revalidatePath } from "next/cache";

export async function createBucket(formData: FormData) {
  const bucketName = formData.get("new-bucket") as string;
  const objectLockEnabled = formData.get("objectLock") === "on";
  const versioningEnabled = formData.get("versioningEnabled") === "on";

  if (!bucketName) {
    throw Error("bucket name is null");
  }
  const s3 = await makeS3Client();
  try {
    await s3.createBucket({ bucketName, objectLockEnabled, versioningEnabled });
    revalidatePath("/buckets");
  } catch (err) {
    return parseS3Error(err);
  }
}
