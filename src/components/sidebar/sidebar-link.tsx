"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

type SidebarLinkProps = {
  title: string;
  href: string;
};

export default function SidebarLink(props: Readonly<SidebarLinkProps>) {
  const { title, href } = props;
  const pathname = usePathname();
  const isRoot = pathname.split("/").splice(0, 2).join("/") === href;

  const hideSidebar = () => {
    const dismissButton = document.getElementById("sidebar-dismiss-btn");
    dismissButton?.click();
  };

  return (
    <li key={href}>
      <Link
        className="text-secondary data-[is-root=true]:bg-light hover:bg-light flex h-10 items-center rounded-lg p-4 bg-blend-multiply transition-colors duration-300 ease-in-out"
        href={href}
        onClick={hideSidebar}
        data-is-root={isRoot}
      >
        {title}
      </Link>
    </li>
  );
}
