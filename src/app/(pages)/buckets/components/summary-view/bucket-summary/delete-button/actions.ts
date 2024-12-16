"use server";
import { parseS3Error } from "@/commons/utils";
import { makeS3Client } from "@/services/s3/actions";
import { revalidatePath } from "next/cache";

export async function deleteBucket(bucket: string) {
  try {
    const s3 = await makeS3Client();
    await s3.deleteBucket(bucket);
    revalidatePath("/buckets");
  } catch (err) {
    return parseS3Error(err);
  }
}
