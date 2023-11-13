import { useContext } from "react";
import { OAuthContextProps, OAuthContext } from "./OAuthContext";

export const useOAuth = (): OAuthContextProps => {
	const context = useContext(OAuthContext);
	if (!context) {
		throw new Error(
			"OAuthContext is undefined, " +
			"please verify you are calling useOAuth " +
			"as a child of OAuthContext component."
		);
	}
	return context;
}
