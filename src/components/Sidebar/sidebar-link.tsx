"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

type SidebarLinkProps = {
  title: string;
  href: string;
};

export default function SidebarLink(props: SidebarLinkProps) {
  const { title, href } = props;
  const pathname = usePathname();

  let className = "p-2 h-10 flex text-secondary rounded-full items-center ";

  if (pathname == href) {
    className += "bg-primary-light";
  } else {
    className += "hover:bg-primary-hover";
  }

  return (
    <li key={href}>
      <Link className={className} href={href}>
        {title}
      </Link>
    </li>
  );
}
