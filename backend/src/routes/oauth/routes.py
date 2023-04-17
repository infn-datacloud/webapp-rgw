from fastapi import APIRouter, HTTPException
from routes.oauth.models import OAuth2TokenRequest
import requests
import os


IAM_AUTHORITY = os.environ['IAM_AUTHORITY']
IAM_CLIENT_ID = os.environ['IAM_CLIENT_ID']
IAM_CLIENT_SECRET = os.environ['IAM_CLIENT_SECRET']

router = APIRouter()


@router.post("/oauth/token")
def get_token(req: OAuth2TokenRequest):

    if (req.client_id != IAM_CLIENT_ID):
        raise HTTPException(status_code=403, detail="Client not allowed.")

    payload = req.dict()
    payload["client_secret"] = IAM_CLIENT_SECRET
    response = requests.post(IAM_AUTHORITY + "/token", payload)
    return response.json()
