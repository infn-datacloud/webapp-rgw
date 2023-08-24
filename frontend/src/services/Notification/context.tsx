import { useRef, useState } from "react";
import { NotificationProps, NotificationType, INotificationContext } from "./types"


export function CreateNotificationContext(): INotificationContext {
  const [notifications, setNotifications] = useState<NotificationProps[]>([]);
  const latestNotifications = useRef(notifications);

  function handleDelete(id: number) {
    latestNotifications.current = [...latestNotifications.current].filter(n => n.id !== id);
    setNotifications(latestNotifications.current);
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

    latestNotifications.current = [...notifications, notification]
    setNotifications(latestNotifications.current);
    console.log("Notification", title, subtitle);
  }
  return {
    notify: notify,
    notifications: notifications
  }
}
