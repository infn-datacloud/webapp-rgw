import { auth } from "@/auth";
import Image from "next/image";
import logo from "@/imgs/infn-cloud.png";
import { Links } from "./nav-links";
import getConfig from "next/config";
import LogoutButton from "./logout-button";
import { UserIcon } from "@heroicons/react/24/solid";
import BurgerButton from "./burger-button";

const { serverRuntimeConfig = {} } = getConfig() || {};

function UserView(props: Readonly<{ username?: string | null }>) {
  const { username } = props;
  return (
    <div className="flex justify-between px-4 py-8">
      {username ? (
        <div className="flex">
          <div className="w-10 rounded-full bg-secondary p-1 text-primary">
            {<UserIcon />}
          </div>
          <h4 className="my-auto ml-2 text-center text-secondary">
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
      <header className="z-5 fixed lg:w-80 left-0 top-0 h-16 w-full bg-primary">
        <div className="flex h-full justify-between px-4">
          <div className="flex py-2">
            <Image src={logo} alt="INFN Cloud" priority={true} width={80} />
            <h2 className="mr-4 mt-auto text-secondary">Object Storage</h2>
          </div>
          <BurgerButton />
        </div>
      </header>
      <aside
        id="left-sidebar"
        className={
          "z-5 fixed left-0 top-16 h-screen w-80 -translate-x-full bg-primary transition-transform lg:translate-x-0"
        }
        aria-label="Sidebar"
      >
        <Links />
        <div className="absolute inset-x-0 bottom-0">
          <hr className="mx-auto w-11/12" />
          <UserView username={username} />
          <div className="w-full bg-primary-light text-center text-sm text-secondary">
            v{props.appVersion}
          </div>
        </div>
      </aside>
    </>
  );
};
