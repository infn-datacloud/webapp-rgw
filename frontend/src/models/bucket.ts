export type RWAccess = {
  read: boolean
  write: boolean
}

export type BucketInfo = {
  name: string,
  creation_date: string;
  detail: Object
  rw_access: RWAccess
  objects: number,
  size: number
}
