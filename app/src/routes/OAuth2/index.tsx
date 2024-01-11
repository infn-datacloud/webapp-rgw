import { Navigate } from "react-router-dom";
import { OAuthTokenRequest, useOAuth } from "../../services/OAuth";
import { useEffect, useRef } from "react";
import {
  useNotifications,
  NotificationType,
} from "../../services/Notifications";

export const OAuth2 = () => {
  const oAuth = useOAuth();
  const { notify } = useNotifications();
  const url = new URL(window.location.href);
  const searchParams = url.searchParams;
  const code = searchParams.get("code");
  const error = searchParams.get("error");
  const error_description = searchParams.get("error_description");
  const code_verifier = searchParams.get("code_verifier");
  const isLoading = useRef(false);

  useEffect(() => {
    if (isLoading.current) {
      return;
    }
    if (error) {
      notify(
        "Login Failed",
        `${error}: ${error_description}`,
        NotificationType.error
      );
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
      notify(
        "Login Failed",
        "Cannot perform token request: missing 'code'",
        NotificationType.error
      );
      console.error("Cannot perform token request: missing 'code'");
    }
  }, [notify, code, code_verifier, oAuth, error, error_description]);

  if (oAuth.isAuthenticated) {
    isLoading.current = false;
  }

  return <Navigate to="/" replace />;
};
