"use client";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "sonner";
import "../globals.css";
import "../index.css";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="inset-0 h-screen bg-primary dark:bg-primary-dark">
        <SessionProvider>{children}</SessionProvider>
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
