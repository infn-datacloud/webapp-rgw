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
        className="w-full"
        title="Logout"
        icon={<ArrowLeftStartOnRectangleIcon />}
        type="submit"
        onClick={logout}
      />
  );
}
