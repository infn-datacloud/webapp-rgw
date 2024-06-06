import { auth } from "@/auth";
import Image from "next/image";
import logo from "@/imgs/infn-cloud.png";
import { Links } from "./nav-links";
import getConfig from "next/config";
import LogoutButton from "./logout-button";
import { UserIcon } from "@heroicons/react/24/solid";

const { serverRuntimeConfig = {} } = getConfig() || {};

function UserView(props: { username?: string | null }) {
  const { username } = props;
  return (
    <div className="flex justify-between px-4 py-8">
      {username ? (
        <div className="flex">
          <div className="w-10 p-1 text-primary bg-secondary rounded-full">
            {<UserIcon />}
          </div>
          <h4 className="text-center ml-2 my-auto text-secondary">
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
    <aside
      id="default-sidebar"
      className={
        "fixed top-0 left-0 z-5 w-80 h-screen transition-transform " +
        "-translate-x-full sm:translate-x-0 bg-primary"
      }
      aria-label="Sidebar"
    >
      <div className="flex px-4 py-8">
        <Image src={logo} alt="INFN Cloud" priority={true} width={100} />
        <h2 className="text-secondary mr-4 mt-auto">Object Storage</h2>
      </div>
      <div>
        <Links />
      </div>
      <div className="absolute inset-x-0 bottom-0">
        <hr className="w-11/12 mx-auto" />
        <UserView username={username} />
        <div className="w-full bg-primary-light text-secondary text-sm text-center">
          v{props.appVersion}
        </div>
      </div>
    </aside>
  );
};
