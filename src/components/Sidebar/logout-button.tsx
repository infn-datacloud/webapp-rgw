"use client";
import { ArrowLeftStartOnRectangleIcon } from "@heroicons/react/24/outline";
import { Button } from "@/components/Button";
import { signOut } from "next-auth/react";

export default function LogoutButton() {
  const logout = async () => {
    await signOut();
  };

  return (
    <Button
      className="mx-auto w-3/4"
      title="Logout"
      icon={<ArrowLeftStartOnRectangleIcon />}
      type="submit"
      color="secondary"
      onClick={logout}
    />
  );
}
