import { NotificationProps } from "./types";
import { useNotifications } from "./useNotifications";
import { Notification } from "./Notification";

export const NotificationsContainer = () => {
  const { notifications } = useNotifications();
  return (
    <div id="notifications-container">
      {notifications.map((n: NotificationProps, i: number) => (
        <Notification key={`notification-${i}`} {...n} />
      ))}
    </div>
  );
};
