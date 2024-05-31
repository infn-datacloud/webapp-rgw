"use client";
import Image from "next/image";
import { ChangeEvent, useEffect, useState } from "react";
import { Button } from "@/components/Button";
import { signIn, signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Input from "@/components/Input";
import logo from "@/imgs/infn.png";

import { addKeyHandler } from "@/commons/utils";

export default function Login() {
  //   const s3 = useS3();
  const [awsAccessKeyId, setAwsAccessKeyId] = useState("");
  const [awsSecretAccessKey, setAwsSecretAccessKey] = useState("");
  const loginEnabled = awsAccessKeyId.length * awsSecretAccessKey.length > 0;
  const router = useRouter();
  const { status, data } = useSession();

  const handleAwsAccessKeyIdChange = (
    element: ChangeEvent<HTMLInputElement>
  ) => {
    setAwsAccessKeyId(element.target.value);
  };

  const handleAwsSecretAccessKeyChange = (
    element: ChangeEvent<HTMLInputElement>
  ) => {
    setAwsSecretAccessKey(element.target.value);
  };

  const handleS3Login = () => {};

  const handleIAMLogin = () => {
    signIn("indigo-iam");
  };

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/home");
    }
  }, [router, status]);

  return (
    <div className="bg-slate-100 w-2/3 xl:w-1/2 max-w-3xl m-auto p-8 shadow-lg mt-16 rounded-md">
      <Image
        src={logo}
        className="mx-auto bg-gray-100 p-4"
        alt="INFN Cloud"
        priority={true}
      />

      <h1 className="mx-auto text-center text-4xl font-extrabold">Welcome</h1>
      <div className="w-1/3 mx-auto mt-8 flex flex-col space-y-4 ">
        <Input
          value={awsAccessKeyId}
          placeholder="Access Key Id"
          onChange={handleAwsAccessKeyIdChange}
        />
        <Input
          value={awsSecretAccessKey}
          placeholder="Access Secret Key"
          type="password"
          onChange={handleAwsSecretAccessKeyChange}
        />
        <Button
          className="mx-auto w-full"
          onClick={handleS3Login}
          title="Login"
          disabled={!loginEnabled}
        />
        <Button
          className="mx-auto w-full"
          onClick={handleIAMLogin}
          title="Login with OpenID connect"
        />
      </div>
    </div>
  );
}
