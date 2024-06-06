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

  let className =
    "h-10 mb-2 flex hover:bg-white text-secondary rounded items-center";

  // if (pathname == href) {
  //   className += "rounded-lg bg-gray-200";
  // }

  return (
    <li key={href}>
      <Link className={className} href={href}>
        {title}
      </Link>
    </li>
  );
}
