"use client";
import { ArrowLeftStartOnRectangleIcon } from "@heroicons/react/24/outline";
import { signOut } from "next-auth/react";

export default function LogoutButton() {
  const logout = async () => {
    await signOut();
  };

  return (
    <button
      className="text-secondary hover:bg-light active:bg-primary-200 my-auto rounded-full p-2 transition"
      type="submit"
      onClick={logout}
    >
      <ArrowLeftStartOnRectangleIcon className="w-5" />
    </button>
  );
}
