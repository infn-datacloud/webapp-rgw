import { createContext } from "react";
import { NotificationProps, NotificationType } from "./types";

export interface NotificationsContextProps {
  notify: (
    message: string,
    subtitle?: string,
    type?: NotificationType,
    timeout?: number
  ) => void;
  notifications: NotificationProps[];
}

export const NotificationsContext = createContext<
  NotificationsContextProps | undefined
>(undefined);
