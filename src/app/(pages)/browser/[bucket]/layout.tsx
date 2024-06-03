"use client";
import {
  NotificationsProvider,
  NotificationsContainer,
} from "@/services/notifications";
import { SessionProvider } from "next-auth/react";

export default function SessionLayout(props: { children: React.ReactNode }) {
  const { children } = props;
  return (
    <NotificationsProvider>
      <NotificationsContainer />
      <SessionProvider>{children}</SessionProvider>
    </NotificationsProvider>
  );
}
