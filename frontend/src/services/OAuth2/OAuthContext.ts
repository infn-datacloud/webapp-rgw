import { IOAuthState } from "./OAuthState";
import { createContext } from "react";
import { OidcToken } from "./OidcConfig";

export interface OAuthContextProps extends IOAuthState {
  signinPopup(): void;
  logout(): void;
  subscribe(callback: (token: OidcToken) => void): void;
  unsubscribe(callback: (token: OidcToken) => void): void;
}

export const OAuthContext = createContext<OAuthContextProps | undefined>(undefined);
