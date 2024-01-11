import { createContext } from "react";
import { OAuthState } from "./OAuthState";
import { OAuthTokenRequest } from ".";
import { UserManagerEvents } from "./utils/UserManagerEvents";

export interface OAuthContextProps extends OAuthState {
  events: UserManagerEvents;
  login: () => void;
  logout: () => void;
  requestToken: (payload: OAuthTokenRequest) => void;
}

export const OAuthContext = createContext<OAuthContextProps | undefined>(
  undefined
);
