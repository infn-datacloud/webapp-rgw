import { UserProfile } from "./UserProfile";

export const parseJwt = (token: string): UserProfile => {
	const base64Payload = token.split('.')[1];
	const payload = window.atob(base64Payload);
	return JSON.parse(payload);
}
