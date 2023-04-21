import { OAuthContext, OAuthContextProps } from "./OAuthContext";
import { useContext } from "react";

export const useOAuth = (): OAuthContextProps => {
  const context = useContext(OAuthContext);
  if (!context) {
    throw new Error(
      "OAuthProvider context is undefined, please verify you are " +
      "calling useOAuth() as child of a <OAuthProvider> componet."
    );
  }
  return context;
}
