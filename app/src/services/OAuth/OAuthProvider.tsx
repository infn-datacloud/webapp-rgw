import { OAuthContext } from "./OAuthContext";
import { initialAuthState } from "./OAuthState";
import { useReducer } from "react";
import { reducer } from "./reducer";
import { OAuthTokenRequest } from ".";
import { User, UserProps } from "./User";
import { UserManagerEvents } from "./utils/UserManagerEvents";
interface OAuthProviderBaseProps {
  children?: React.ReactNode;
}

export interface OAuthProviderProps extends OAuthProviderBaseProps {}

export const OAuthProvider = (props: OAuthProviderProps): JSX.Element => {
  const { children } = props;
  const [state, dispatch] = useReducer(reducer, initialAuthState);
  const manager = new UserManagerEvents();

  const login = () => {
    if (!state.isLoading) {
      console.debug("Logging with OIDC");
      const redirect_uri = `${window.location.origin}/callback`;
      window.location.href =
        `${window.location.origin}/api/v1/oauth/authorize?` +
        `redirect_uri=${redirect_uri}`;
    }
  };

  const logout = () => {
    manager.unload();
    dispatch({ type: "LOGGED_OUT" });
  };

  const requestToken = async (payload: OAuthTokenRequest) => {
    dispatch({ type: "LOGGING_IN" });
    const url = `${window.location.origin}/api/v1/oauth/token`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    const data: UserProps = await response.json();
    const user = new User(data);
    manager.load(user);
    dispatch({ type: "LOGGED_IN", user });
  };

  return (
    <OAuthContext.Provider
      value={{
        ...state,
        events: manager,
        login,
        logout,
        requestToken,
      }}
    >
      {children}
    </OAuthContext.Provider>
  );
};
