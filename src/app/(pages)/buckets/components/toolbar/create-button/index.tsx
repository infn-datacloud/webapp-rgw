"use client";
import { Button } from "@/components/buttons";
import { PlusIcon } from "@heroicons/react/24/outline";
import CreateBucketModal from "./modal";
import { useState } from "react";

export default function CreateBucketButton() {
  const [show, setShow] = useState(false);
  const open = () => setShow(true);
  const close = () => setShow(false);

  return (
    <>
      <CreateBucketModal show={show} onClose={close} />
      <Button
        title="Create Bucket"
        icon={<PlusIcon />}
        type="button"
        onClick={open}
      />
    </>
  );
}
