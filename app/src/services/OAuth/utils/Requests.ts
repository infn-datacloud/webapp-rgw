export interface OAuthTokenRequest {
	code: string;
	redirect_uri: string;
	[key: string]: string;
}
