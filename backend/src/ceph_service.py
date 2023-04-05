import boto3
import json
import os

MINIO_ENDPOINT = os.getenv("MINIO_ENDPOINT", "http://minio:9000")
AWS_ACCESS_KEY_ID = os.getenv("MINIO_ACCESS_KEY_ID", "minioadmin")
AWS_SECRET_ACCESS_KEY = os.getenv("MINIO_SECRET_ACCESS_KEY", "minioadmin")
AWS_SESSION_TOKEN = None


def get_s3_client():
    resource = boto3.resource('s3',
                              endpoint_url=MINIO_ENDPOINT,
                              aws_access_key_id=AWS_ACCESS_KEY_ID,
                              aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
                              aws_session_token=AWS_SESSION_TOKEN,
                              config=boto3.session.Config(signature_version='s3v4'),
                              verify=False
                              )
    client = resource.meta.client
    return client


def list_buckets() -> json:
    s3 = get_s3_client()
    buckets = s3.list_buckets()
    buckets = {key: buckets[key] for key in ["Buckets", "Owner"]}
    return json.dumps(buckets, default=str)

