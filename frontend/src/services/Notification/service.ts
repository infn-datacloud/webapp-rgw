import { createContext, useContext } from "react";
import { INotificationContext } from "./types";

export const NotificationContext = createContext<INotificationContext | undefined>(undefined);

export const useNotifications = (): INotificationContext => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "NotificationContext is undefined, " +
      "please verify you are calling useNotifications " +
      "as a child of NotificationContext component."
    );
  }
  return context;
}
