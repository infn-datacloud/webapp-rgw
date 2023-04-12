from models.buckets import BucketInfo, BucketRWAccess, BucketInfoResponse
from models.buckets import Bu
import boto3
import json
import os

MINIO_ENDPOINT = os.getenv("MINIO_ENDPOINT", "http://minio:9000")
AWS_ACCESS_KEY_ID = os.getenv("MINIO_ACCESS_KEY_ID", "minioadmin")
AWS_SECRET_ACCESS_KEY = os.getenv("MINIO_SECRET_ACCESS_KEY", "minioadmin")
AWS_SESSION_TOKEN = None


def get_s3_client():
    return boto3.resource('s3',
                          endpoint_url=MINIO_ENDPOINT,
                          aws_access_key_id=AWS_ACCESS_KEY_ID,
                          aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
                          aws_session_token=AWS_SESSION_TOKEN,
                          config=boto3.session.Config(signature_version='s3v4'),
                          verify=False
                          )


def list_buckets() -> BucketInfoResponse:
    s3 = get_s3_client()
    client = s3.meta.client
    response = client.list_buckets()
    buckets_info = response["Buckets"]
    buckets = [None] * len(buckets_info)
    for i, bucket_info in enumerate(buckets_info):
        bucket_name = bucket_info["Name"]
        creation_date = bucket_info["CreationDate"]
        bucket_acl = client.get_bucket_acl(Bucket=bucket_name)
        grant = bucket_acl["Grants"][0]    # TODO: Here we can have multiple grants
        permission = grant["Permission"]
        read = permission in ("READ", "FULL_CONTROL")
        write = permission in ("WRITE", "FULL_CONTROL")
        objects = s3.Bucket(bucket_name).objects.all()
        n_objects = 0
        size_byte = 0
        for obj in objects:
            n_objects += 1
            size_byte += obj.size
        rw_access = BucketRWAccess(read=read, write=write)
        buckets[i] = BucketInfo(
            name=bucket_name,
            creation_date=creation_date,
            details={},
            rw_access=rw_access,
            objects=n_objects,
            size=size_byte
        )
    return BucketInfoResponse(buckets=buckets, total=len(buckets))
