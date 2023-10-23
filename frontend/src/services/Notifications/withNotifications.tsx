import {
  NotificationsProvider,
} from "./NotificationsProvider";
import { NotificationProps } from "./types";
import { Notification } from "./component";
import { useNotifications } from "./useNotifications";

type Props = {
  Comp?: React.ComponentType
}

const NotificationsContainer = () => {
  const { notifications } = useNotifications();
  return (
    <div id="notifications-container">
      {notifications.map(
        (n: NotificationProps, i: number) =>
          <Notification key={`notification-${i}`} {...n} />
      )}
    </div>
  )
}

export function withNotifications(WrappedComponent: React.FunctionComponent<Props>) {
  return function (props: Props) {
    return (
      <NotificationsProvider>
        <NotificationsContainer />
        <WrappedComponent {...props} />
      </NotificationsProvider>
    )
  }
}
