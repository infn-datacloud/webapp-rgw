import type { User } from './User';

export interface IOAuthState {
  user?: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  activeNavigator?: "signinRedirect";
  error?: Error;
}

export const initialOAuthState: IOAuthState = {
  user: null,
  isLoading: true,
  isAuthenticated: false
}
