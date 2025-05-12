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
        className="btn-secondary"
        title="Create Bucket"
        type="button"
        onClick={open}
      >
        <PlusIcon className="size-5" />
        Create Bucket
      </Button>
    </>
  );
}
