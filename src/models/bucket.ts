// SPDX-FileCopyrightText: 2025 Istituto Nazionale di Fisica Nucleare
//
// SPDX-License-Identifier: EUPL-1.2

import { _Object } from "@aws-sdk/client-s3";

export class FileObjectWithProgress {
  id: string;
  object: _Object;
  progress: number;
  file: File;

  constructor(object: _Object, file: File) {
    this.id = self.crypto.randomUUID();
    this.object = object;
    this.file = file;
    this.progress = 0;
  }

  setProgress(value: number) {
    this.progress = value;
  }
}

export type BucketConfiguration = {
  versioning: boolean;
  objectLock: boolean;
};
