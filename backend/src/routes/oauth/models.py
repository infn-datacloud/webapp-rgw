from pydantic import BaseModel
from typing import Optional

class OAuth2TokenRequest(BaseModel):
    client_id: str
    code: Optional[str]
    refresh_token: Optional[str]
    grant_type: str
    redirect_uri: str
    code_verifier: Optional[str]
