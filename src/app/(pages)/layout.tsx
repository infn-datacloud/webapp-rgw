import type { Metadata } from "next";
import { Toaster } from "sonner";
import { Sidebar } from "@/components/Sidebar";
import "@/app/globals.css";
import "@/app/index.css";

export const metadata: Metadata = {
  title: "INFN Cloud Object Storage",
  description: "INFN Cloud Object Storage",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <main className="h-full dark:bg-gray-800">
          <Sidebar />
          <div className="mt-16 p-4 lg:ml-80 lg:mt-0">{children}</div>
        </main>
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
