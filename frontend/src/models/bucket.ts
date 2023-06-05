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
  Key?: string,
  LastModified?: Date,
  ETag?: string,
  Size?: number,
  StorageClass?: string,
  Owner?: Owner
}