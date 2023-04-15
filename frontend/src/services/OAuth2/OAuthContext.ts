import { IOAuthState } from "./OAuthState";
import { createContext } from "react";

export interface OAuthContextProps extends IOAuthState {
  signinPopup(): void;
}

export const OAuthContext = createContext<OAuthContextProps | undefined>(undefined);
