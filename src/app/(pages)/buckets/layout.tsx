import { NotificationsProvider } from "@/services/notifications";
import { NotificationsContainer } from "@/services/notifications/NotificationContainer";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  console.log("layout")
  return (
    <NotificationsProvider>
      <NotificationsContainer />
      {children}
    </NotificationsProvider>
  );
}
