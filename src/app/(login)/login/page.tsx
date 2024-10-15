import Image from "next/image";
import logo from "@/imgs/logo-ceph.png";
import LoginForm from "./components/login-form";
import { Suspense } from "react";

export default function Login() {
  return (
    <div className="p-16">
    <div className="m-auto mt-16 w-11/12 max-w-2xl rounded-lg bg-secondary p-8 text-primary sm:w-1/2 dark:bg-slate-800 dark:text-secondary">
      <h1 className="mx-auto text-center">INFN Cloud Object Storage</h1>
      <Image
        src={logo}
        className="mx-auto p-4"
        alt="INFN Cloud"
        height={100}
        priority={true}
      />
      <h2 className="mx-auto text-center">Welcome</h2>
      <div className="mx-auto mt-8 flex max-w-48 flex-col space-y-2">
        <Suspense>
          <LoginForm />
        </Suspense>
        </div>
      </div>
    </div>
  );
}
