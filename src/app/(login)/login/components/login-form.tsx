"use client";

import { Button } from "@/components/Button";
import Form from "@/components/Form";
import Input from "@/components/Input";
import { NotificationType, useNotifications } from "@/services/notifications";
import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";

export default function LoginForm() {
  const { notify } = useNotifications();
  const searchParams = useSearchParams();
  const notifyRef = useRef(notify);
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    const error = searchParams.get("error");
    const code = searchParams.get("code");
    if (error) {
      notifyRef.current(code ?? "Unknown Error", "", NotificationType.error);
      router.push("/login")
    }
  }, [router, searchParams]);

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/");
    }
  }, [status, router]);

  const handleCredentialsLogin = async (formData: FormData) => {
    console.log("signing in");
    router.push("/");
    await signIn(
      "credentials",
      {
        accessKeyId: formData.get("accessKeyId"),
        secretAccessKey: formData.get("secretAccessKey"),
      },
      { redirect: true }
    );
    console.log("signed in");
  };

  const handleIAMLogin = async () => {
    await signIn("indigo-iam");
  };

  return (
    <>
      <Form action={handleCredentialsLogin} className="space-y-2">
        <Input name="accessKeyId" placeholder="Access Key Id" required />
        <Input
          name="secretAccessKey"
          placeholder="Secret Access Key"
          type="password"
          required
        />
        <Button className="w-full" title="Login" type="submit" />
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
