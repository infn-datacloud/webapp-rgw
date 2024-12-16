"use client";
import { ArrowLeftStartOnRectangleIcon } from "@heroicons/react/24/outline";
import { signOut } from "next-auth/react";

export default function LogoutButton() {
  const logout = async () => {
    await signOut();
  };

  return (
    <button
      className="my-auto rounded-full p-2 text-secondary transition hover:bg-primary-hover active:bg-primary-200"
      type="submit"
      onClick={logout}
    >
      <ArrowLeftStartOnRectangleIcon className="w-5" />
    </button>
  );
}
