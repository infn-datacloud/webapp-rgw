import { useEffect } from "react";
import { OAUTH_RESPONSE_MESSAGE_TYPE, OAUTH_STATE_STORAGE_KEY } from "../../commons/costants";

const checkState = (receivedState: string) => {
  const state = sessionStorage.getItem(OAUTH_STATE_STORAGE_KEY);
  console.log("received:", receivedState, "expceted:", state);
  return state === receivedState;
}

const queryToObject = (query: string) => {
  const parameters = new URLSearchParams(query);
  return Object.fromEntries(parameters.entries());
}

export const OAuthPopup = () => {
  useEffect(() => {
    const payload = queryToObject(window.location.search.split("?")[1])
    const state = payload && payload.state;
    const error = payload && payload.error;
    
    if (!window.opener) {
      throw new Error("No window opener");
    }

    if (error) {
      window.opener.postMessage({
        type: OAUTH_RESPONSE_MESSAGE_TYPE,
        error: decodeURI(error) || "OAuth error: An error has occured."
      });
    } else if (state && checkState(state)) {
      window.opener.postMessage({
        type: OAUTH_RESPONSE_MESSAGE_TYPE,
        payload
      })
    } else {
      window.opener.postMessage({
        type: OAUTH_RESPONSE_MESSAGE_TYPE,
        error: "OAuth error: State mismatch."
      });
    }
  }, []);

  return (
    <div className="font-lg mx-auto mt-10">
      Loading...
    </div>
  );
}
