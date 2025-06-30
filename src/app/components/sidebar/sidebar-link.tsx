// SPDX-FileCopyrightText: 2025 Istituto Nazionale di Fisica Nucleare
//
// SPDX-License-Identifier: EUPL-1.2

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type SidebarLinkProps = {
  title: string;
  href: string;
  onClick?: () => void;
};

export default function SidebarLink(props: Readonly<SidebarLinkProps>) {
  const { title, href, onClick } = props;
  const pathname = usePathname();
  const isRoot = pathname.split("/").splice(0, 2).join("/") === href;

  return (
    <Link
      className="text-secondary data-[is-root=true]:bg-light hover:bg-light flex h-10 items-center rounded-lg p-4 bg-blend-multiply transition-colors duration-300 ease-in-out"
      href={href}
      onClick={onClick}
      data-is-root={isRoot}
    >
      {title}
    </Link>
  );
}
