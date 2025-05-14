// SPDX-FileCopyrightText: 2025 Istituto Nazionale di Fisica Nucleare
//
// SPDX-License-Identifier: EUPL-1.2

import { FileObjectWithProgress } from "@/models/bucket";
import { S3Client } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";

export async function uploadObject(
  client: S3Client,
  bucket: string,
  fileObject: FileObjectWithProgress,
  onChange?: () => void,
  onComplete?: () => void
) {
  const upload = new Upload({
    client: client,
    params: {
      Bucket: bucket,
      Key: fileObject.object.Key,
      Body: fileObject.file,
    },
  });
  upload.on("httpUploadProgress", progress => {
    if (onChange) {
      let { loaded, total } = progress;
      loaded = loaded ?? 0;
      total = total ?? 1;
      fileObject.setProgress(loaded / total);
      onChange();
    }
  });
  upload.done().then(() => {
    console.debug(`Object ${fileObject.object.Key} uploaded`);
    if (onComplete) {
      onComplete();
    }
  });
}
