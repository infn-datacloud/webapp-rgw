// SPDX-FileCopyrightText: 2025 Istituto Nazionale di Fisica Nucleare
//
// SPDX-License-Identifier: EUPL-1.2

import { getSession, signIn } from "@/auth";
import logo from "@/imgs/logo-ceph.png";
import Spinner from "@/components/spinner";
import { Button } from "@/components/buttons";
import Form from "@/components/form";
import { Input } from "@/components/inputs";
import Image from "next/image";
import { redirect } from "next/navigation";
import { Suspense } from "react";

function Loading() {
  return (
    <div className="fixed inset-0 z-10 bg-gray-600/50 backdrop-blur-sm">
      <div className="text-secondary mx-auto mt-48 h-16 w-16">
        <Spinner />
        <p className="text-secondary mt-8 text-xl">Loading...</p>
      </div>
    </div>
  );
}

export default async function Login() {
  const session = await getSession();
  if (session) {
    redirect("/");
  }

  async function loginWithCredentials() {
    "use server";
  }

  async function loginWithOAuth2() {
    "use server";
    await signIn();
  }

  return (
    <div className="bg-primary dark:bg-primary-dark inset-0 flex h-screen items-center p-4 xl:items-start">
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
          <Suspense fallback={<Loading />}>
            <Form action={loginWithCredentials} className="space-y-2">
              <Input name="accessKeyId" placeholder="Access Key Id" required />
              <Input
                name="secretAccessKey"
                placeholder="Secret Access Key"
                type="password"
                required
              />
              <Button
                className="btn-primary block w-full text-center"
                title="Login with local credentials"
                type="submit"
              >
                Login with local credentials
              </Button>
            </Form>
            <Form action={loginWithOAuth2}>
              <Button
                className="btn-primary mx-auto block w-full"
                title="Login with INDIGO IAM"
                type="submit"
              >
                Login with INDIGO IAM
              </Button>
            </Form>
          </Suspense>
        </div>
      </div>
    </div>
  );
}
