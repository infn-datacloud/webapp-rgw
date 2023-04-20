import type { User } from './User';

export interface IOAuthState {
  user?: User;
  isLoading: boolean;
  isAuthenticated: boolean;
  activeNavigator?: "signinRedirect";
  error?: Error;
}

export const initialOAuthState: IOAuthState = {
  user: undefined,
  isLoading: true,
  isAuthenticated: false
}
