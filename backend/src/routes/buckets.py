from models.buckets import BucketInfoResponse, BucketContentResponse, BucketNotfound
from fastapi import APIRouter, HTTPException, Response
from botocore.exceptions import ClientError
import ceph_service

router = APIRouter()


@router.get("/buckets")
def list_buckets() -> BucketInfoResponse:
    return ceph_service.list_buckets()


@router.get("/buckets/{bucket_name}")
def list_bucket(bucket_name: str) -> BucketContentResponse:
    try:
        return ceph_service.list_bucket(bucket_name=bucket_name)
    except ClientError as err:
        status = err.response["ResponseMetadata"]["HTTPStatusCode"]
        detail = err.response["Error"]["Code"]
        headers = err.response["ResponseMetadata"]["HTTPHeaders"]
        raise HTTPException(status_code=status, detail=detail, headers=headers)
