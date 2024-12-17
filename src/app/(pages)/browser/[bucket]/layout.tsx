"use client";
import { SessionProvider } from "next-auth/react";

export default function SessionLayout(
  props: Readonly<{ children: React.ReactNode }>
) {
  const { children } = props;
  return <SessionProvider>{children}</SessionProvider>;
}
