import { useCallback, useEffect, useRef, useState } from "react"
import { OAuthContext } from "./OAuthContext"
import { IOAuthState, initialOAuthState } from "./OAuthState"
import { OAUTH_RESPONSE_MESSAGE_TYPE, OAUTH_STATE_STORAGE_KEY } from "../../commons/costants"
import { tokenPostRequest, TokenRequestParams } from "./OAuthTokenRequest"
import { OidcToken, OidcClientSettings } from "./OidcConfig"
import { User } from "./User"

const OAUTH_USER_SESSION_STORAGE_KEY = "oauth-user-session-key";

interface OAuthProviderProps extends OidcClientSettings {
  children?: React.ReactNode;
}

type Timer = ReturnType<typeof setTimeout>;


const getAuthorizationUrl = (props: OidcClientSettings) => {
  const url = new URL("/authorize", props.authority);
  const urlSearchParams = new URLSearchParams({ ...props });
  urlSearchParams.delete("authority");
  urlSearchParams.delete("children");       // TODO: implement a better keys filter
  url.search = urlSearchParams.toString();
  return url.toString();
}

const generateState = () => {
  const validChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let array = new Uint8Array(40);
  window.crypto.getRandomValues(array);
  array = array.map((x) => validChars.codePointAt(x % validChars.length) || 0);
  const randomState = String.fromCharCode.apply(null, Array.from(array));
  return randomState;
};

const saveState = (state: string) => {
  sessionStorage.setItem(OAUTH_STATE_STORAGE_KEY, state);
}

const saveUserSession = (user: User) => {
  sessionStorage.setItem(OAUTH_USER_SESSION_STORAGE_KEY, user.toStorageString());
}

const restoreUserSession = () => {
  const userString = sessionStorage.getItem(OAUTH_USER_SESSION_STORAGE_KEY);
  if (userString) {
    return User.fromStorageString(userString);
  }
}

const openWindow = (url: string) => {
  return window.open(url);
}

const closePopup = (popupRef: React.MutableRefObject<Window | undefined>) => {
  popupRef.current?.close();
}

const cleanup = (
  intervalRef: React.MutableRefObject<Timer | undefined>,
  popupRef: React.MutableRefObject<Window | undefined>,
  handleMessageListener: (message: any) => Promise<void>) => {
  clearInterval(intervalRef.current);
  closePopup(popupRef);
  window.removeEventListener('message', handleMessageListener);
}

const parseJwt = (token: string) => {
  var base64Payload = token.split('.')[1];
  var payload = window.atob(base64Payload);
  return JSON.parse(payload);
}

let didInit = false;
let observers: ((token: OidcToken) => void)[] = []
const subscribe = (fn: (token: OidcToken) => void) => {
  observers.push(fn);
}

const unsuscribe = (fn: (token: OidcToken) => void) => {
  observers = observers.filter(o => {
    return o !== fn;
  });
}

export const OAuthProvider = (props: OAuthProviderProps): JSX.Element => {
  const { children } = props;
  const [oAuthState, setOAuthState] = useState<IOAuthState>(initialOAuthState);
  const popupRef = useRef<Window>();
  const intervalRef = useRef<Timer>();

  const getAccessToken = (params: TokenRequestParams) => {
    // Send POST request to backend
    tokenPostRequest(params)
      .then(response => response.json())
      .then(data => {
        const token = OidcToken.createTokenFromResponse(data);
        // The user is now logged in
        const user = new User({
          session_state: null,
          profile: parseJwt(token.access_token),
          token: token
        });

        saveUserSession(user);
        setOAuthState({
          isLoading: false,
          isAuthenticated: true,
          user: user
        });
        observers.forEach(o => o(token));
      })
      .catch((err) => {
        console.error(err);
        setOAuthState({
          isLoading: false,
          isAuthenticated: false,
          error: err instanceof Error ? err : new Error("Uknown error")
        });
      });
  };

  const handleRefreshToken = (_: Event) => {
    if (!(oAuthState.user && oAuthState.user.token)) {
      return;
    }
    const { token } = oAuthState.user;
    if (!token.expired) {
      return
    }

    console.log("Refreshing token");
    getAccessToken({
      client_id: props.client_id,
      redirect_uri: props.redirect_uri,
      refresh_token: token.refresh_token,
      grant_type: "refresh_token"
    });
  };

  // Try to restore User from sessionStorage
  useEffect(() => {
    if (didInit) {
      return;
    }
    const restoredUser = restoreUserSession();
    if (!(restoredUser && restoredUser.token)) {
      return;
    }

    const { token } = restoredUser;
    const isAuthenticated = token && !token.expired;
    if (isAuthenticated) {
      observers.forEach(o => o(token));
    }
    setOAuthState({
      isAuthenticated: isAuthenticated,
      isLoading: false,
      user: restoredUser
    });
    didInit = true;
    console.log("User's session resumed");
  }, []);

  // This effect is triggered at each click
  useEffect(() => {
    window.addEventListener("click", handleRefreshToken);
    return () => {
      window.removeEventListener("click", handleRefreshToken);
    }
  });

  const signinPopup = useCallback(() => {
    // 1. Init 
    setOAuthState(initialOAuthState);

    // 2. Generate and save state
    const state = generateState();
    saveState(state);

    // 3. Open window
    const url = getAuthorizationUrl({ ...props, state });
    popupRef.current = openWindow(url) || undefined;

    // 4. Register message listener
    async function handleMessageListener(message: MessageEvent) {
      const { data } = message;

      if (!data || data?.type !== OAUTH_RESPONSE_MESSAGE_TYPE) {
        return;
      }

      try {
        const { error } = data;
        if (error) {
          setOAuthState({
            isLoading: false,
            isAuthenticated: false,
            error: new Error(error)
          });
          console.error(error);
        } else {
          const { code } = data.payload;
          getAccessToken({
            client_id: props.client_id,
            redirect_uri: props.redirect_uri,
            code: code,
            grant_type: "authorization_code"
          });
        }
      } catch (err) {
        setOAuthState({
          isLoading: false,
          isAuthenticated: false,
          error: err instanceof Error ? err : new Error("Uknown error")
        });
        console.log(err);
      } finally {
        cleanup(intervalRef, popupRef, handleMessageListener);
      }
    }
    window.addEventListener('message', handleMessageListener);

    // 5. Begin interval to check if popup was closed forcelly by the user
    intervalRef.current = setInterval(() => {
      const popupClosed = !popupRef.current
        || !popupRef.current.window
        || popupRef.current.window.closed;
      if (popupClosed) {
        setOAuthState({
          isAuthenticated: false,
          isLoading: false,
        });
        console.warn("Warning: Popup was closed before completing authentication.");
        cleanup(intervalRef, popupRef, handleMessageListener);
      }
    }, 250);

    // 6. Remove listener(s) on unmount
    return () => {
      window.removeEventListener('message', handleMessageListener);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };

  }, [props]);

  const logout = useCallback(() => {
    setOAuthState(initialOAuthState);
    sessionStorage.clear();
  }, []);

  return (
    <OAuthContext.Provider
      value={{
        signinPopup: signinPopup,
        logout: logout,
        subscribe: subscribe,
        unsubscribe: unsuscribe,
        isAuthenticated: oAuthState.isAuthenticated,
        isLoading: oAuthState.isLoading,
        error: oAuthState.error,
        user: oAuthState.user
      }}
    >
      {children}
    </OAuthContext.Provider>
  )
}
