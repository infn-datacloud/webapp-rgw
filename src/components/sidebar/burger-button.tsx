// SPDX-FileCopyrightText: 2025 Istituto Nazionale di Fisica Nucleare
//
// SPDX-License-Identifier: EUPL-1.2

"use client";

import { Bars3Icon } from "@heroicons/react/24/outline";
const sidebarId = "left-sidebar";

export default function BurgerButton() {
  function toggleSidebar() {
    const sidebar = document.getElementById(sidebarId);
    if (!sidebar) {
      console.warn(`element with id '${sidebarId}' not found`);
      return;
    }
    sidebar?.classList.toggle("translate-x-0");

    const dismissButton = document.getElementById("sidebar-backdrop");
    dismissButton?.classList.toggle("opacity-0");
    dismissButton?.classList.toggle("pointer-events-none");
  }

  return (
    <button
      className="hover:bg-light active:bg-primary-200 my-auto rounded-md p-1 transition lg:hidden"
      onClick={toggleSidebar}
    >
      <Bars3Icon className="text-secondary w-8" />
    </button>
  );
}
