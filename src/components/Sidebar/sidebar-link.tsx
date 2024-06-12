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

  let className = "p-4 h-10 flex text-secondary rounded-full items-center ";

  if (pathname == href || pathname === "/browser") {
    className += "bg-primary-light bg-blend-multiply";
  } else {
    className += "hover:bg-primary-hover";
  }

  const hideSidebar = () => {
    const dismissButton = document.getElementById("sidebar-dismiss-btn");
    dismissButton?.click();
  };

  return (
    <li key={href}>
      <Link className={className} href={href} onClick={hideSidebar}>
        {title}
      </Link>
    </li>
  );
}
