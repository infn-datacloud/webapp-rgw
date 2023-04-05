from fastapi import APIRouter
import ceph_service

router = APIRouter()


@router.get("/buckets")
def list_buckets():
    return ceph_service.list_buckets()
