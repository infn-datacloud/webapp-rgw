import { useContext } from "react";
import {
  NotificationsContext,
  NotificationsContextProps
} from "./NotificationsContext";

export const useNotifications = (): NotificationsContextProps => {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error(
      "NotificationsContext is undefined, " +
      "please verify you are calling useNotifications " +
      "as a child of NotificationsContext component."
    );
  }
  return context;
}
