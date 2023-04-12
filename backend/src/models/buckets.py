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

