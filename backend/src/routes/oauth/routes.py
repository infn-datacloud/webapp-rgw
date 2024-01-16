from .models import OAuthTokenRequest, OAuthTokenResponse
from .services import decode_token
from fastapi import APIRouter, Request, HTTPException
from fastapi.responses import RedirectResponse
import requests
import os


IAM_AUTHORITY = os.environ["IAM_AUTHORITY"]
IAM_CLIENT_ID = os.environ["IAM_CLIENT_ID"]
IAM_CLIENT_SECRET = os.environ["IAM_CLIENT_SECRET"]
IAM_SCOPE = os.environ["IAM_SCOPE"]
IAM_AUDIENCE = os.getenv("IAM_AUDIENCE")

router = APIRouter()


@router.get("/oauth/callback")
def redirect(request: Request):
    print(request)


@router.get("/oauth/authorize")
async def login(redirect_uri: str, request: Request):
    url_params = {
        "response_type": "code",
        "client_id": IAM_CLIENT_ID,
        "scope": IAM_SCOPE,
        "redirect_uri": redirect_uri
    }

    if IAM_AUDIENCE is not None:
        url_params["aud"] = IAM_AUDIENCE

    url_params = "&".join([f"{k}={v}" for k, v in url_params.items()])
    return RedirectResponse(f"{IAM_AUTHORITY}/authorize?{url_params}")


@router.post("/oauth/token")
async def get_token(oAuth: OAuthTokenRequest, request: Request) -> OAuthTokenResponse:
    payload = {
        "client_id": IAM_CLIENT_ID,
        "client_secret": IAM_CLIENT_SECRET,
        "code": oAuth.code,
        "grant_type": "authorization_code",
        "redirect_uri": oAuth.redirect_uri
    }

    if (oAuth.code_verifier is not None):
        payload["code_verifier"] = oAuth.code_verifier

    try:
        response = requests.post(IAM_AUTHORITY + "/token", payload).json()

        if not decode_token(response["id_token"], response["access_token"]):
            raise RuntimeError("access token not valid")
        return response

    except Exception as e:
        return HTTPException(500, detail=e)
