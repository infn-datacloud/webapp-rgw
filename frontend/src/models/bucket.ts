import { Owner } from "@aws-sdk/client-s3";

export interface RWAccess {
  read: boolean
  write: boolean
}

export interface BucketInfo {
  name: string,
  creation_date: string;
  rw_access: RWAccess
  objects: number,
  size: number
}

export interface BucketObject {
  Key: string,
  LastModified?: Date,
  ETag?: string,
  Size?: number,
}

export class BucketObjectWithProgress {
  object: BucketObject;
  progress: number;

  constructor(bucket: BucketObject) {
    this.object = bucket;
    this.progress = 0;
  };

  setProgress(value: number) {
    this.progress = value;
  }
}
