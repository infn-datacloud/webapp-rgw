"use client";
import { NotificationsProvider } from "@/services/notifications";
import { NotificationsContainer } from "@/services/notifications";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <NotificationsProvider>
      <NotificationsContainer />
      {children}
    </NotificationsProvider>
  );
}
