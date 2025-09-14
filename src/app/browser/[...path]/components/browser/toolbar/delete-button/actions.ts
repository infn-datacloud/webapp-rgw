// SPDX-FileCopyrightText: 2025 Istituto Nazionale di Fisica Nucleare
//
// SPDX-License-Identifier: EUPL-1.2

"use server";

import { S3Service } from "@/services/s3";
import { makeS3Client } from "@/services/s3/actions";
import { _Object, CommonPrefix, ObjectIdentifier } from "@aws-sdk/client-s3";

export async function deleteFolders(
  s3: S3Service,
  bucket: string,
  prefixes: CommonPrefix[]
) {
  return prefixes.map(pr =>
    s3.listObjects(bucket, 1000, pr.Prefix).then(output => {
      return s3.deleteObjects(bucket, output?.Contents as ObjectIdentifier[]);
    })
  );
}

export async function deleteAll(
  bucket: string,
  objects: _Object[],
  folders: CommonPrefix[]
) {
  const s3 = await makeS3Client();
  const promises = await deleteFolders(s3, bucket, folders);
  promises.push(s3.deleteObjects(bucket, objects as ObjectIdentifier[]));
  return Promise.allSettled(promises);
}
