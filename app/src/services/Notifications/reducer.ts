import { NotificationProps } from "./types";

export interface NotificationsProviderState {
  notifications: NotificationProps[];
}

export const initialState: NotificationsProviderState = { notifications: [] };

export const reducer = (oldState: NotificationsProviderState,
  newState: NotificationsProviderState) => {
  return { ...oldState, ...newState }
}
