from pydantic import BaseModel

class OAuthTokenRequest(BaseModel):
    code: str
    code_verifier: str | None = None

class OAuthTokenResponse(BaseModel):
    access_token: str
    id_token: str | None = None
    expires_in: int
    token_type: str
    refresh_token: str | None = None
    scope: str | None = None
