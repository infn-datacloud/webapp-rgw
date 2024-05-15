export enum NotificationType {
  info,
  success,
  warning,
  error,
}

export interface NotificationProps {
  id: number;
  title: string;
  subtitle?: string;
  timeout?: number;
  type: NotificationType;
  onDelete?: (id: number) => void;
}
