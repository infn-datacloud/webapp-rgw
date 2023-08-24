export enum NotificationType {
  info,
  success,
  warning,
  error
}

export interface NotificationProps {
  id: number;
  title: string;
  subtitle?: string;
  timeout?: number;
  type: NotificationType;
  onDelete?: (id: number) => void;
}

export interface INotificationContext {
  notify: (message: string, subtitle?: string, type?: NotificationType, timeout?: number) => void;
  notifications: NotificationProps[];
}