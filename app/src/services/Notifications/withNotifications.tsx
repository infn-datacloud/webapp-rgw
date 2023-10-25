import { NotificationsProvider } from "./NotificationsProvider";
import { NotificationsContainer } from "./NotificationContainer";

type Props = {
  Comp?: React.ComponentType
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
