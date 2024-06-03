import { _Object } from "@aws-sdk/client-s3";
export interface RWAccess {
  read: boolean;
  write: boolean;
}

export interface BucketInfo {
  name: string;
  creation_date?: string;
  rw_access: RWAccess;
  objects: number;
  size: number;
}
export class FileObjectWithProgress {
  object: _Object;
  progress: number;
  file: File;

  constructor(object: _Object, file: File) {
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
