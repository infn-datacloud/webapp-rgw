// SPDX-FileCopyrightText: 2025 Istituto Nazionale di Fisica Nucleare
//
// SPDX-License-Identifier: EUPL-1.2

import { ArrowLeftStartOnRectangleIcon } from "@heroicons/react/24/outline";
import { signOut } from "next-auth/react";

export function LogoutButton() {
  return (
    <button
      className="text-secondary hover:bg-light active:bg-primary-200 my-auto rounded-full p-2 transition"
      onClick={() => signOut()}
    >
      <ArrowLeftStartOnRectangleIcon className="w-5" />
    </button>
  );
}
