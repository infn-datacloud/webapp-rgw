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
        <aside
          id="default-sidebar"
          className="fixed top-0 left-0 z-40 w-64 h-screen transition-transform -translate-x-full sm:translate-x-0"
          aria-label="Sidebar"
        >
          <Sidebar />
        </aside>
        <main className="p-4 sm:ml-64">{children}</main>
        <Toaster position="top-right"/>
      </body>
    </html>
  );
}
