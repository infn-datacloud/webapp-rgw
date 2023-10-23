import { useRef, useState } from "react";
import { NotificationProps, NotificationType } from "./types";
import { NotificationsContext } from "./NotificationsContext";

interface NotificationsProviderBaseProps {
	children?: React.ReactNode;
}

export interface NotificationsProviderProps extends NotificationsProviderBaseProps { };

export const NotificationsProvider = (props: NotificationsProviderProps): JSX.Element => {
	const { children } = props;
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
	return (
		<NotificationsContext.Provider
			value={{
				notify,
				notifications
			}}
		>
			{children}
		</NotificationsContext.Provider>
	)
}
