from models.buckets import BucketInfoResponse
from fastapi import APIRouter
import ceph_service

router = APIRouter()


@router.get("/buckets")
def list_buckets() -> BucketInfoResponse:
    return ceph_service.list_buckets()
