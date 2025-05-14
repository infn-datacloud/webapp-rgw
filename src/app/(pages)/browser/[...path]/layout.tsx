// SPDX-FileCopyrightText: 2025 Istituto Nazionale di Fisica Nucleare
//
// SPDX-License-Identifier: EUPL-1.2

"use client";
import { SessionProvider } from "next-auth/react";

export default function SessionLayout(
  props: Readonly<{ children: React.ReactNode }>
) {
  const { children } = props;
  return <SessionProvider>{children}</SessionProvider>;
}
