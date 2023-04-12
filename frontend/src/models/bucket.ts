export interface RWAccess {
  read: boolean
  write: boolean
}

export interface BucketInfo {
  name: string,
  creation_date: string;
  detail: Object
  rw_access: RWAccess
  objects: number,
  size: number
}

export interface BucketOwner {
  DisplayName: string,
  ID: string
}
export interface BucketObject {
  Key: string,
  LastModified: string,
  ETag: string,
  Size: number,
  StorageClass: string,
  Owner: BucketOwner
}