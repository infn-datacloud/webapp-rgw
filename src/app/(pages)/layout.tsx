// SPDX-FileCopyrightText: 2025 Istituto Nazionale di Fisica Nucleare
//
// SPDX-License-Identifier: EUPL-1.2

import type { Metadata } from "next";
import getConfig from "next/config";
import { Toaster } from "sonner";
import { Sidebar } from "@/components/sidebar";
import { auth } from "@/auth";
import "@/app/app.css";

export const metadata: Metadata = {
  title: "INFN Cloud Object Storage",
  description: "INFN Cloud Object Storage",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await auth();
  const username = session?.user?.name;
  const { serverRuntimeConfig = {} } = getConfig() || {};

  return (
    <html lang="en">
      <body className="h-screen dark:bg-gray-800">
        <Sidebar
          username={username}
          appVersion={serverRuntimeConfig.appVersion}
        />
        <main className="mt-16 p-4 lg:mt-0 lg:ml-80">{children}</main>
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
