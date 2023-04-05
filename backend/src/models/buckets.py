from pydantic import BaseModel
from datetime import datetime
from typing import List


class BucketRWAccess(BaseModel):
    read: bool
    write: bool


class Bucket(BaseModel):
    name: str
    creation_date: datetime
    details: dict
    rw_access: BucketRWAccess


class BucketResponse(BaseModel):
    buckets: List[Bucket]
    total: int
