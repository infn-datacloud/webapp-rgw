export interface RWAccess {
  read: boolean;
  write: boolean;
}

export interface BucketInfo {
  name: string;
  creation_date: string;
  rw_access: RWAccess;
  objects: number;
  size: number;
}

export interface BucketObject {
  Key: string;
  LastModified?: Date;
  ETag?: string;
  Size?: number;
}

export class FileObjectWithProgress {
  object: BucketObject;
  progress: number;
  file: File;

  constructor(object: BucketObject, file: File) {
    this.object = object;
    this.file = file;
    this.progress = 0;
  }

  setProgress(value: number) {
    this.progress = value;
  }
}
