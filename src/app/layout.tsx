// SPDX-FileCopyrightText: 2025 Istituto Nazionale di Fisica Nucleare
//
// SPDX-License-Identifier: EUPL-1.2

import type { Metadata } from "next";
import { Toaster } from "sonner";
import { settings } from "@/config";
import "@/app/app.css";

const { WEBAPP_RGW_APPLICATION_TITLE, WEBAPP_RGW_APPLICATION_DESCRIPTION } =
  settings;

export const metadata: Metadata = {
  title: WEBAPP_RGW_APPLICATION_TITLE,
  description: WEBAPP_RGW_APPLICATION_DESCRIPTION,
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="h-screen dark:bg-gray-800">
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
