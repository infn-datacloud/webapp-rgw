// SPDX-FileCopyrightText: 2025 Istituto Nazionale di Fisica Nucleare
//
// SPDX-License-Identifier: EUPL-1.2

import { ArrowLeftStartOnRectangleIcon } from "@heroicons/react/24/outline";
import { signOut } from "@/auth";
import { redirect } from "next/navigation";

export function LogoutButton() {
  async function logout() {
    "use server";
    await signOut();
    redirect("/");
  }
  return (
    <form action={logout}>
      <button
        className="text-secondary hover:bg-light active:bg-primary-200 rounded-full p-2 transition"
        type="submit"
      >
        <ArrowLeftStartOnRectangleIcon className="w-5" />
      </button>
    </form>
  );
}
