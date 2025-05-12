import { auth } from "@/auth";
import Image from "next/image";
import logo from "@/imgs/infn-cloud.png";
import { Links } from "./nav-links";
import getConfig from "next/config";
import LogoutButton from "./logout-button";
import { UserIcon } from "@heroicons/react/24/solid";
import BurgerButton from "./burger-button";
import DismissButton from "./dismiss-button";

const { serverRuntimeConfig = {} } = getConfig() || {};

function UserView(props: Readonly<{ username?: string | null }>) {
  const { username } = props;
  return (
    <div className="border-secondary flex w-full justify-between border-t p-4">
      {username ? (
        <div className="flex">
          <div className="bg-secondary text-primary w-10 rounded-full p-1">
            {<UserIcon />}
          </div>
          <h4 className="text-secondary my-auto ml-2 text-center">
            {username}
          </h4>
        </div>
      ) : null}
      <LogoutButton />
    </div>
  );
}

export const getStaticProps = function () {
  return {
    props: {
      appVersion: serverRuntimeConfig.appVersion || "",
    },
  };
};

export const Sidebar = async () => {
  const session = await auth();
  const username = session?.user?.name;
  const { props } = getStaticProps();

  return (
    <>
      <DismissButton
        id="sidebar-dismiss-btn"
        className="fixed inset-0 z-10 hidden transition-transform"
      />
      <header className="dark:bg-primary-dark bg-primary fixed top-0 left-0 z-30 h-16 w-screen lg:w-80">
        <div className="flex h-full justify-between px-4">
          <div className="flex py-2">
            <Image src={logo} alt="INFN Cloud" priority={true} width={80} />
            <h2 className="text-secondary mt-auto mr-4 truncate text-nowrap">
              Object Storage
            </h2>
          </div>
          <BurgerButton />
        </div>
      </header>
      <aside
        id="left-sidebar"
        className="dark:bg-primary-dark bg-primary fixed top-16 bottom-0 left-0 z-30 w-80 -translate-x-full transition-transform lg:translate-x-0"
        aria-label="Sidebar"
      >
        <nav className="p-4">
          <Links />
        </nav>
        <div className="absolute inset-x-0 bottom-0">
          <div className="px-4">
            <UserView username={username} />
          </div>
          <div className="text-secondary w-full bg-slate-600 p-1.5 text-center text-sm">
            v{props.appVersion}
          </div>
        </div>
      </aside>
    </>
  );
};
