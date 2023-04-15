import { useCallback, useRef, useState } from "react"
import { OAuthContext } from "./OAuthContext"
import { IOAuthState, initialOAuthState } from "./OAuthState"
import { OAUTH_RESPONSE_MESSAGE_TYPE, OAUTH_STATE_STORAGE_KEY } from "../../commons/costants"
import { tokenPostRequest } from "./OAuthTokenRequest"
import { OidcToken, OidcClientSettings } from "./OidcConfig"
import { User } from "./User"


interface OAuthProviderProps extends OidcClientSettings {
  children?: React.ReactNode;
}

type Timer = ReturnType<typeof setTimeout>;


const getAuthorizationUrl = (props: OidcClientSettings) => {
  let url = `${props.authority}` +
    `/authorize?` +
    `&redirect_uri=${props.redirect_uri}` +
    `&client_id=${props.client_id}`

  url += props.client_secret ? `&client_secret=${props.client_secret}` : "";
  url += props.response_type ? `&response_type=${props.response_type}` : "";
  url += props.scope ? `&scope=${props.scope}` : "";
  url += props.state ? `&state=${props.state}` : "";
  return url;
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

export const OAuthProvider = (props: OAuthProviderProps): JSX.Element => {
  const { children } = props;
  const [oAuthState, setOAuthState] = useState<IOAuthState>(initialOAuthState);
  const popupRef = useRef<Window>();
  const intervalRef = useRef<Timer>();

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
    async function handleMessageListener(message: any) {

      if (message?.data?.type !== OAUTH_RESPONSE_MESSAGE_TYPE) {
        return;
      }

      try {
        const errorMaybe = message && message.data && message.data.error;
        if (errorMaybe) {
          setOAuthState({
            isLoading: false,
            isAuthenticated: false,
            error: errorMaybe && new Error(errorMaybe)
          });
          console.log(errorMaybe);
        } else {
          const { code } = message && message.data && message.data.payload;
          // Sent POST request to backend
          tokenPostRequest({
            client_id: props.client_id,
            redirect_uri: props.redirect_uri,
            code: code,
            grant_type: props.grant_type,
            code_verifier: undefined
          })
            .then(response => response.json())
            .then(data => {
              const token = OidcToken.createTokenFromResponse(data);
              const user = new User({
                session_state: null,
                profile: parseJwt(token.access_token),
                token: token
              });
              // The user is now logged in
              console.log(parseJwt(token.access_token));
              setOAuthState({
                isLoading: false,
                isAuthenticated: true,
                user: user
              });
            })
            .catch((err) => {
              console.error(err);
              setOAuthState({
                isLoading: false,
                isAuthenticated: false,
                error: err instanceof Error ? err : new Error("Uknown error")
              });
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

  return (
    <OAuthContext.Provider
      value={{
        signinPopup: signinPopup,
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
