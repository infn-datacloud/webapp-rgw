import { Navigate } from "react-router-dom";
import { OAuthTokenRequest, useOAuth } from "../../services/OAuth";
import { useEffect, useRef } from "react";

export const OAuth2 = () => {
	const oAuth = useOAuth();
	const url = new URL(window.location.href);
	const searchParams = url.searchParams;
	const code = searchParams.get("code");
	const code_verifier = searchParams.get("code_verifier");
	const isLoading = useRef(false);

	useEffect(() => {
		if (isLoading.current) {
			return;
		}
		if (code) {
			const redirect_uri = `${window.location.origin}/callback`;
			let payload: OAuthTokenRequest = { code, redirect_uri };
			if (code_verifier) {
				payload = { ...payload, code_verifier };
			}
			oAuth.requestToken(payload);
			isLoading.current = true;
		} else {
			console.error("Cannot perform token request: missing 'code'")
		}
	}, [code, code_verifier, oAuth.requestToken, oAuth.isLoading]);

	if (oAuth.isAuthenticated) {
		isLoading.current = false;
	}

	return <Navigate to="/" replace />;
}
