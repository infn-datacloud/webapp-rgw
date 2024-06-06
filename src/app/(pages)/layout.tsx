import type { Metadata } from "next";
import { Toaster } from "sonner";
import { Sidebar } from "@/components/Sidebar";
import "@/app/globals.css";
import "@/app/index.css";

export const metadata: Metadata = {
  title: "INFN Cloud S3 Storage",
  description: "INFN Cloud S3 Storage",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <Sidebar />
        <main className="p-4 sm:ml-64">{children}</main>
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
