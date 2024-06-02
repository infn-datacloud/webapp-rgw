import Image from "next/image";
import logo from "@/imgs/infn.png";
import LoginForm from "./components/login-form";
import { Suspense } from "react";

export default function Login() {
  return (
    <div className="bg-slate-100 w-2/3 xl:w-1/2 max-w-3xl m-auto p-8 shadow-lg mt-16 rounded-md">
      <Image
        src={logo}
        className="mx-auto bg-gray-100 p-4"
        alt="INFN Cloud"
        priority={true}
      />
      <h1 className="mx-auto text-center text-4xl font-extrabold">Welcome</h1>
      <div className="w-1/3 mx-auto mt-8 flex flex-col space-y-2">
        <Suspense>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
