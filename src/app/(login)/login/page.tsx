import Image from "next/image";
import logo from "@/imgs/logo-ceph.png";
import LoginForm from "./components/login-form";
import { Suspense } from "react";

export default function Login() {
  return (
    <div className="m-auto mt-16 w-11/12 max-w-2xl rounded-lg bg-secondary p-8 sm:w-1/2">
      <h1 className="mx-auto text-center text-primary">
        INFN Cloud Object Storage
      </h1>
      <Image
        src={logo}
        className="mx-auto p-4"
        alt="INFN Cloud"
        height={100}
        priority={true}
      />
      <h2 className="mx-auto text-center text-primary">Welcome</h2>
      <div className="mx-auto mt-8 flex flex-col space-y-2 max-w-48">
        <Suspense>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
