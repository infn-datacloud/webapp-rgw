// SPDX-FileCopyrightText: 2025 Istituto Nazionale di Fisica Nucleare
//
// SPDX-License-Identifier: EUPL-1.2

"use client";

import { Button } from "@/components/buttons";
import Form from "@/components/form";
import Input from "@/components/inputs/input";
import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Spinner from "@/components/spinner";

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

export default function LoginForm() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    setLoading(false);
  }, [router, searchParams, setLoading]);

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/");
    }
  }, [status, router]);

  const handleCredentialsLogin = (formData: FormData) => {
    const login = async () => {
      await signIn("credentials", {
        accessKeyId: formData.get("accessKeyId"),
        secretAccessKey: formData.get("secretAccessKey"),
      });
    };
    setLoading(true);
    login();
  };

  const handleIAMLogin = () => {
    const login = async () => {
      await signIn("indigo-iam");
    };
    setLoading(true);
    login();
  };

  return (
    <>
      {loading ? <Loading /> : null}
      <Form action={handleCredentialsLogin} className="space-y-2">
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
      <Form action={handleIAMLogin}>
        <Button
          className="btn-primary mx-auto block w-full"
          title="Login with INDIGO IAM"
          type="submit"
        >
          Login with INDIGO IAM
        </Button>
      </Form>
    </>
  );
}
