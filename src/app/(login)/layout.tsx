"use client";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "sonner";
import "@/app/app.css";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-primary dark:bg-primary-dark inset-0 h-screen">
        <SessionProvider>{children}</SessionProvider>
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
