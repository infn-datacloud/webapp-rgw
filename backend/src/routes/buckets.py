from models.buckets import BucketResponse
from fastapi import APIRouter
import ceph_service

router = APIRouter()


@router.get("/buckets")
def list_buckets() -> BucketResponse:
    return ceph_service.list_buckets()
