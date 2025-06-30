// SPDX-FileCopyrightText: 2025 Istituto Nazionale di Fisica Nucleare
//
// SPDX-License-Identifier: EUPL-1.2

"use client";

import Image from "next/image";
import logo from "@/imgs/infn-cloud.png";
import { LogoutButton } from "./logout-button";
import { Bars3Icon, UserIcon } from "@heroicons/react/24/solid";
import { useState } from "react";
import { Button } from "@/components/buttons";
import { Transition } from "@headlessui/react";
import SidebarLink from "./sidebar-link";

function UserView(props: Readonly<{ username?: string | null }>) {
  const { username } = props;
  return (
    <div className="border-secondary flex w-full justify-between border-t p-4">
      {username ? (
        <div className="flex">
          <div className="bg-secondary text-primary w-10 rounded-full p-1">
            {<UserIcon />}
          </div>
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
  appVersion?: string | null;
};

export function Sidebar(props: Readonly<SidebarProps>) {
  const { username, appVersion } = props;
  const [show, setShow] = useState(false);
  const toggle = () => setShow(!show);
  const close = () => setShow(false);

  return (
    <>
      <header className="dark:bg-primary-dark bg-primary fixed top-0 left-0 z-30 h-16 w-screen lg:w-80">
        <div className="flex h-full justify-between px-4">
          <div className="flex py-2">
            <Image src={logo} alt="INFN Cloud" priority={true} width={80} />
            <h2 className="text-secondary mt-auto mr-4 truncate text-nowrap">
              Object Storage
            </h2>
          </div>
          <button
            className="hover:bg-light active:bg-primary-200 my-auto rounded-md p-1 transition lg:hidden"
            onClick={toggle}
          >
            <Bars3Icon className="text-secondary w-8" />
          </button>
        </div>
      </header>
      <Transition show={show}>
        <Button
          id="sidebar-backdrop"
          className="fixed inset-0 z-10 bg-black/30 transition data-closed:opacity-0"
          onClick={toggle}
        />
      </Transition>
      <aside
        className="dark:bg-primary-dark bg-primary easy-in-out fixed top-16 bottom-0 left-0 z-30 w-80 transition-transform duration-200 data-[closed=true]:-translate-x-full lg:!translate-x-0"
        aria-label="Sidebar"
        data-closed={!show}
      >
        <nav className="p-4">
          <SidebarLink title="Browser" href="/browser" onClick={close} />
          <SidebarLink title="Buckets" href="/buckets" onClick={close} />
        </nav>
        <div className="absolute inset-x-0 bottom-0">
          <div className="px-4">
            <UserView username={username} />
          </div>
          <div className="text-secondary w-full bg-slate-600 p-1.5 text-center text-sm">
            v{appVersion}
          </div>
        </div>
      </aside>
    </>
  );
}
