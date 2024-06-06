"use client";
import { ArrowLeftStartOnRectangleIcon } from "@heroicons/react/24/outline";
import { signOut } from "next-auth/react";

export default function LogoutButton() {
  const logout = async () => {
    await signOut();
  };

  return (
    <button
      className="w-8 h-8 my-auto text-secondary rounded-full hover:bg-secondary-hover"
      type="submit"
      onClick={logout}
    >
      <ArrowLeftStartOnRectangleIcon />
    </button>
  );
}
