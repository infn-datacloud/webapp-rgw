import { createContext, useContext, useRef, useState } from "react";
import { Notification, NotificationProps, NotificationType } from "./component";

interface NotificationContext {
  notify: (message: string, subtitle?: string, type?: NotificationType, timeout?: number) => void;
  notifications: NotificationProps[];
};

const notificationContext = createContext<NotificationContext | undefined>(undefined);

function CreateNotificationContext(): NotificationContext {
  const [notifications, setNotifications] = useState<NotificationProps[]>([]);
  const latestNotifications = useRef(notifications);

  function handleDelete(id: number) {
    latestNotifications.current = [...latestNotifications.current].filter(n => n.id !== id);
    setNotifications(latestNotifications.current);
  };

  function notify(title: string, subtitle?: string, type: NotificationType = NotificationType.info, timeout: number = 5000) {
    const notification = {
      id: Date.now(),
      title: title,
      subtitle: subtitle,
      timeout: timeout,
      type: type,
      onDelete: handleDelete
    };

    latestNotifications.current = [...notifications, notification]
    setNotifications(latestNotifications.current);
    console.log("Notification", title, subtitle);
  }
  return {
    notify: notify,
    notifications: notifications
  }
}

export const useNotifications = (): NotificationContext => {
  const context = useContext(notificationContext);
  if (!context) {
    throw new Error(
      "NotificationContext is undefined, " +
      "please verify you are calling useNotifications " +
      "as a child of NotificationContext component."
    );
  }
  return context;
}

export function withNotifications(WrappedComponent: React.FunctionComponent) {
  return function (props: any) {
    const context = CreateNotificationContext();
    const { notifications } = context;
    return (
      <notificationContext.Provider value={context}>
        <WrappedComponent {...props} />;
        {notifications.map(
          (n, i) => <Notification key={`notification-${i}`} {...n} />
        )}
      </notificationContext.Provider>
    );
  };
}