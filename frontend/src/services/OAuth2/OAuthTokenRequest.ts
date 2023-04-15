import { API_ENDPOINT } from "../../commons/costants";

const defaultGrantType = "authorization_code";

interface TokenRequestParams {
  client_id: string;
  redirect_uri: string;
  code: string;
  grant_type?: string;
  code_verifier?: string;
}

export function tokenPostRequest(params: TokenRequestParams): Promise<Response> {
  params.grant_type = params.grant_type ?? defaultGrantType;
  return fetch(API_ENDPOINT + "/oauth/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(params)
  });
}
