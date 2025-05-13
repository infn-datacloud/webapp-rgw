import Image from "next/image";
import logo from "@/imgs/logo-ceph.png";
import LoginForm from "./components/login-form";
import { Suspense } from "react";

export default function Login() {
  return (
    <div className="flex h-screen items-center p-4 xl:items-start">
      <div className="bg-secondary text-primary dark:text-secondary mx-auto rounded-xl p-8 shadow-2xl sm:max-w-96 dark:bg-slate-800">
        <h1 className="mx-auto text-center">INFN Cloud Object Storage</h1>
        <Image
          src={logo}
          className="mx-auto p-4"
          alt="INFN Cloud"
          height={100}
          priority={true}
        />
        <h2 className="mx-auto text-center">Welcome</h2>
        <div className="mx-auto mt-8 flex max-w-54 flex-col space-y-2">
          <Suspense>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
