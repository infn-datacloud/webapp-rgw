from pydantic import BaseModel
from datetime import datetime
from typing import List


class BucketRWAccess(BaseModel):
    read: bool
    write: bool


class BucketInfo(BaseModel):
    name: str
    creation_date: datetime
    details: dict
    rw_access: BucketRWAccess
    objects: int
    size: int


class BucketInfoResponse(BaseModel):
    buckets: List[BucketInfo]
    total: int


class BucketOwner(BaseModel):
    DisplayName: str
    ID: str


class BucketObject(BaseModel):
    Key: str
    LastModified: datetime
    ETag: str
    Size: int
    StorageClass: str
    Owner: BucketOwner

class BucketNotfound:
    status: str
    detail: str
    headers: dict

class BucketContentResponse(BaseModel):
    buckets: List[BucketObject]
    total: int
