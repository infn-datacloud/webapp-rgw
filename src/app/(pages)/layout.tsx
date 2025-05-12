import type { Metadata } from "next";
import { Toaster } from "sonner";
import { Sidebar } from "@/components/sidebar";
import "@/app/app.css";

export const metadata: Metadata = {
  title: "INFN Cloud Object Storage",
  description: "INFN Cloud Object Storage",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="h-screen dark:bg-gray-800">
        <Sidebar />
        <main className="mt-16 p-4 lg:ml-80 lg:mt-0">{children}</main>
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
