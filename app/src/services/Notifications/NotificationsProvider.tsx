import { useReducer } from "react";
import { NotificationType } from "./types";
import { NotificationsContext } from "./NotificationsContext";
import { initialState, reducer } from "./reducer";

interface NotificationsProviderBaseProps {
  children?: React.ReactNode;
}

export interface NotificationsProviderProps extends NotificationsProviderBaseProps { }

export const NotificationsProvider = (props: NotificationsProviderProps): JSX.Element => {
  const { children } = props;
  const [state, dispatch] = useReducer(reducer, initialState);
  const { notifications } = state;

  function handleDelete(id: number) {
    dispatch({ notifications: notifications.filter(n => n.id !== id) });
  }

  function notify(title: string, subtitle?: string, type: NotificationType = NotificationType.info, timeout: number = 5000) {
    const notification = {
      id: Date.now(),
      title: title,
      subtitle: subtitle,
      timeout: timeout,
      type: type,
      onDelete: handleDelete
    };
    dispatch({ notifications: notifications.concat(notification) });
    console.log("Notification", title, subtitle);
  }
  return (
    <NotificationsContext.Provider
      value={{
        notify,
        notifications
      }}
    >
      {children}
    </NotificationsContext.Provider>
  )
}
