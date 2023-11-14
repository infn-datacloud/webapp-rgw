import requests
import json
import jwt
import os


IAM_AUTHORITY = os.environ["IAM_AUTHORITY"]
IAM_AUDIENCE = os.environ["IAM_AUDIENCE"]


def get_oidc_config():
	url = f"{IAM_AUTHORITY}/.well-known/openid-configuration"
	r = requests.get(url)
	return r.json()


def decode_token(id_token: str, access_token):
	iam_config = get_oidc_config()
	jwk_uri = iam_config["jwks_uri"]
	jwks = requests.get(jwk_uri).json()
	public_keys = {}
	for jwk in jwks['keys']:
			kid = jwk['kid']
			public_keys[kid] = jwt.algorithms.RSAAlgorithm.from_jwk(json.dumps(jwk))

	kid = jwt.get_unverified_header(id_token)['kid']
	key = public_keys[kid]
	return jwt.decode(
		access_token,
		key=key,
		audience=IAM_AUDIENCE,
		algorithms=['RS256']
	)
