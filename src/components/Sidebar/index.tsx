import { ArrowLeftStartOnRectangleIcon } from "@heroicons/react/24/outline";
import { Button } from "@/components/Button";
import { auth } from "@/auth";
import Image from "next/image";
import logo from "@/imgs/infn.png";
import { Links } from "./nav-links";

export const Sidebar = async () => {
  const session = await auth();
  const username = session?.user?.name;

  const handleLogout = async () => {
    "use server";
    console.log("Logout");
  };

  return (
    <aside
      id="default-sidebar"
      className={
        "fixed top-0 left-0 z-40 w-64 h-screen transition-transform " +
        "-translate-x-full sm:translate-x-0 bg-gray-100"
      }
      aria-label="Sidebar"
    >
      <Image
        src={logo}
        className="mx-auto p-4"
        alt="INFN Cloud"
        priority={true}
      />
      <div>
        {username ? (
          <div className="p-4 mx-auto text-xl font-semibold">{username}</div>
        ) : null}
        <Links />
      </div>
      <div className="absolute inset-x-0 mx-4 bottom-20">
        <Button
          className="w-full"
          title="Logout"
          icon={<ArrowLeftStartOnRectangleIcon />}
          onClick={handleLogout}
        />
      </div>
      <div className="absolute bottom-2 w-full text-sm text-center">
        v{process.env.APP_VERSION}
      </div>
    </aside>
  );
};
