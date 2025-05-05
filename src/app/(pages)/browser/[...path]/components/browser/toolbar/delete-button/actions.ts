"use server";

import { S3Service } from "@/services/s3";
import { makeS3Client } from "@/services/s3/actions";
import { _Object, CommonPrefix, ObjectIdentifier } from "@aws-sdk/client-s3";

export async function deleteFolders(
  s3: S3Service,
  bucket: string,
  prefixes: CommonPrefix[]
) {
  const objectsPromises = prefixes.map(pr =>
    s3.listObjects(bucket, 1000, pr.Prefix)
  );
  const responses = await Promise.all(objectsPromises);
  const objectsLists = responses
    .filter(v => v !== undefined)
    .map(response => response.Contents ?? []);
  const deletePromises = objectsLists.map(objectsList =>
    s3.deleteObjects(bucket, objectsList as ObjectIdentifier[])
  );
  await Promise.all(deletePromises);
}

export async function deleteAll(
  bucket: string,
  objects: _Object[],
  folders: CommonPrefix[]
) {
  const s3 = await makeS3Client();
  const promises = [
    s3.deleteObjects(bucket, objects as ObjectIdentifier[]),
    deleteFolders(s3, bucket, folders),
  ];
  await Promise.all(promises);
}
