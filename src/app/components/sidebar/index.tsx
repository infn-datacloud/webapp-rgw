// SPDX-FileCopyrightText: 2025 Istituto Nazionale di Fisica Nucleare
//
// SPDX-License-Identifier: EUPL-1.2

import { Gravatar } from "@/components/gravatar";
import { LogoutButton } from "./logout-button";
import SidebarLink from "./sidebar-link";
import { Drawer } from "./drawer";

type UserViewProps = {
  username?: string | null;
  email?: string | null;
};

function UserView(props: Readonly<UserViewProps>) {
  const { username, email } = props;
  return (
    <div className="border-secondary flex w-full items-center justify-between border-t p-4">
      {username ? (
        <div className="flex">
          <Gravatar email={email} />
          <h4 className="text-secondary my-auto ml-2 text-center">
            {username}
          </h4>
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
};

export function Sidebar(props: Readonly<SidebarProps>) {
  const { username, email, appVersion } = props;
  return (
    <Drawer>
      <nav className="p-4">
        <SidebarLink title="Browser" href="/browser" />
        <SidebarLink title="Buckets" href="/buckets" />
      </nav>
      <div className="absolute inset-x-0 bottom-0">
        <div className="px-4">
          <UserView username={username} email={email} />
        </div>
        <div className="text-secondary w-full bg-slate-600 p-1.5 text-center text-sm">
          v{appVersion}
        </div>
      </div>
    </Drawer>
  );
}
