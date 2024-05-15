import type { Metadata } from "next";
import { Sidebar } from "@/components/Sidebar";
import "@/app/globals.css";
import "@/app/index.css";

export const metadata: Metadata = {
  title: "INDIGO IAM",
  description: "INDIGO Identity Access Management",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
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
        <div className="p-4 sm:ml-64">{children}</div>
      </body>
    </html>
  );
}
