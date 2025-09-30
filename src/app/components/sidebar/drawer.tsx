// SPDX-FileCopyrightText: 2025 Istituto Nazionale di Fisica Nucleare
//
// SPDX-License-Identifier: EUPL-1.2


"use client";

import Image from "next/image";
import { useState } from "react";
import { Transition } from "@headlessui/react";
import { Bars3Icon } from "@heroicons/react/24/solid";
import { Button } from "@/components/buttons";
import logo from "@/imgs/infn-cloud.png";

type DrawerProps = {
  children?: React.ReactNode;
};

export function Drawer(props: Readonly<DrawerProps>) {
  const { children } = props;
  const [show, setShow] = useState(false);
  const toggle = () => setShow(!show);
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
        {children}
      </aside>
    </>
  );
}
