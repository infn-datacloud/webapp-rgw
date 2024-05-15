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
    "h-10 mb-2 flex hover:text-white hover:bg-infn items-center " +
    "hover:rounded-lg ph-4 ";

  if (pathname == href) {
    className += "rounded-lg bg-gray-200";
  }

  return (
    <li className={className} key={href}>
      <Link className="p-4" href={href}>
        {title}
      </Link>
    </li>
  );
}
