import Image from "next/image";
import logo from "@/imgs/infn.png";
import LoginForm from "./components/login-form";
import { Suspense } from "react";

export default function Login() {
  return (
    <div className="bg-secondary w-2/3 xl:w-1/2 max-w-3xl m-auto p-8 shadow-lg mt-16 rounded-lg">
      <Image
        src={logo}
        className="mx-auto p-4"
        alt="INFN Cloud"
        height={200}
        priority={true}
      />
      <h1 className="mx-auto text-center text-primary">Welcome</h1>
      <div className="w-1/3 mx-auto mt-8 flex flex-col space-y-2">
        <Suspense>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
