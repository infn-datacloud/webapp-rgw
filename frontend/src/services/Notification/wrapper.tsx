import { CreateNotificationContext } from "./context";
import { NotificationContext } from "./service";
import { NotificationProps } from "./types";
import { Notification } from "./component";

type Props = {
  Comp?: React.ComponentType
}

export function withNotifications(WrappedComponent: React.FunctionComponent<Props>) {
  return function (props: Props) {
    const context = CreateNotificationContext();
    const { notifications } = context;
    return (
      <NotificationContext.Provider value={context}>
        <WrappedComponent {...props} />
        {notifications.map(
          (n: NotificationProps, i: number) =>
            <Notification key={`notification-${i}`} {...n} />
        )}
      </NotificationContext.Provider>
    );
  };
}
