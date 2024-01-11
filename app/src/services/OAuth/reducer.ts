import { OAuthState } from "./OAuthState";
import { User } from "./User";

type Action =
  | { type: "LOGGING_IN" }
  | { type: "LOGGED_IN"; user: User }
  | { type: "LOGGED_OUT" };

export const reducer = (state: OAuthState, action: Action): OAuthState => {
  switch (action.type) {
    case "LOGGING_IN":
      return {
        ...state,
        isAuthenticated: false,
        isLoading: true,
      };
    case "LOGGED_IN":
      return {
        ...state,
        isAuthenticated: true,
        isLoading: false,
        user: action.user,
      };
    case "LOGGED_OUT":
      return {
        ...state,
        isAuthenticated: false,
        isLoading: false,
        user: undefined,
      };
  }
};
