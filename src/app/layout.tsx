// SPDX-FileCopyrightText: 2025 Istituto Nazionale di Fisica Nucleare
//
// SPDX-License-Identifier: EUPL-1.2

import type { Metadata } from "next";
import { Toaster } from "sonner";
import "@/app/app.css";

export const metadata: Metadata = {
  title: "INFN Cloud Object Storage",
  description: "INFN Cloud Object Storage",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="h-screen dark:bg-gray-800">
        <main>{children}</main>
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
