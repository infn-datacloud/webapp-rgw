// SPDX-FileCopyrightText: 2025 Istituto Nazionale di Fisica Nucleare
//
// SPDX-License-Identifier: EUPL-1.2

import { Gravatar } from "@/components/gravatar";
import { LogoutButton } from "./logout-button";
import SidebarLink from "./sidebar-link";
import { Drawer } from "./drawer";
import NextLink from "next/link";

type UserViewProps = {
  username?: string | null;
  email?: string | null;
};

function UserView(props: Readonly<UserViewProps>) {
  const { username, email } = props;
  return (
    <div className="border-secondary flex max-w-full items-center justify-between gap-1 border-t py-4">
      {username ? (
        <div className="flex w-full truncate">
          <Gravatar email={email} />
          <h4 className="text-secondary my-auto ml-2 truncate">{username}</h4>
        </div>
      ) : null}
      <LogoutButton />
    </div>
  );
}

type SidebarProps = {
  username?: string | null;
  email?: string | null;
  appVersion?: string | null;
  appTitle?: string | null;
  logo?: string | null;
};

export function Sidebar(props: Readonly<SidebarProps>) {
  const { username, email, appVersion, appTitle, logo } = props;
  return (
    <Drawer appTitle={appTitle} logo={logo}>
      <nav className="p-4">
        <SidebarLink title="Browser" href="/browser" />
        <SidebarLink title="Buckets" href="/buckets" />
      </nav>
      <div className="absolute inset-x-0 bottom-0">
        <div className="px-4">
          <UserView username={username} email={email} />
        </div>
        <div className="flex w-full bg-slate-600 p-1.5">
          <NextLink
            className="w-full text-center text-sm text-blue-400 hover:underline"
            href={`https://github.com/infn-datacloud/webapp-rgw/releases/tag/v${appVersion}`}
          >
            v{appVersion}
          </NextLink>
        </div>
      </div>
    </Drawer>
  );
}
