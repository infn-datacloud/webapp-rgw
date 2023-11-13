import { User } from "./User";

export interface OAuthState {
	isLoading: boolean;
	isAuthenticated: boolean;
	user?: User;
}

export const initialAuthState: OAuthState = {
	isAuthenticated: false,
	isLoading: false,
	user: undefined
}
