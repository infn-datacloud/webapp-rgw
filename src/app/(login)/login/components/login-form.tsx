"use client";
import { Button } from "@/components/buttons";
import Form from "@/components/form";
import Input from "@/components/inputs/input";
import { toaster } from "@/components/toaster";
import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import Spinner from "@/components/spinner";

function Loading() {
  return (
    <div className="fixed inset-0 z-10 bg-gray-600/50 backdrop-blur-sm">
      <div className="mx-auto mt-48 h-16 w-16 text-secondary">
        <Spinner />
        <p className="mt-8 text-xl text-secondary">Loading...</p>
      </div>
    </div>
  );
}

export default function LoginForm() {
  const searchParams = useSearchParams();

  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    const error = searchParams.get("error");
    const code = searchParams.get("code");
    if (error) {
      toaster.danger(code ?? "Unknown Error", "");
    }
  }, [router, searchParams]);

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/");
    }
  }, [status, router]);

  const handleCredentialsLogin = async (formData: FormData) => {
    await signIn("credentials", {
      accessKeyId: formData.get("accessKeyId"),
      secretAccessKey: formData.get("secretAccessKey"),
    });
  };

  const handleIAMLogin = async () => {
    await signIn("indigo-iam");
  };

  return (
    <>
      {status === "loading" ? <Loading /> : null}
      <Form action={handleCredentialsLogin} className="space-y-2">
        <Input name="accessKeyId" placeholder="Access Key Id" required />
        <Input
          name="secretAccessKey"
          placeholder="Secret Access Key"
          type="password"
          required
        />
        <Button
          className="w-full"
          title="Login with local credentials"
          type="submit"
        />
      </Form>
      <Form action={handleIAMLogin}>
        <Button
          className="w-full"
          title="Login with INDIGO IAM"
          type="submit"
        />
      </Form>
    </>
  );
}
