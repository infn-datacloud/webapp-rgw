"use client";
import { useState } from "react";
import EditBucketModal from "./modal";
import { PencilSquareIcon } from "@heroicons/react/24/outline";
import { Button } from "@/components/buttons";
import { BucketConfiguration } from "@/models/bucket";

export default function EditBucketButton(props: {
  bucket: string;
  configuration?: BucketConfiguration;
}) {
  const { bucket, configuration } = props;
  const [show, setShow] = useState(false);
  const open = () => setShow(true);
  const close = () => setShow(false);
  return (
    <>
      <EditBucketModal
        bucket={bucket}
        show={show}
        onClose={close}
        configuration={
          configuration ?? { versioning: false, objectLock: false }
        }
      />
      <Button className="btn-primary" onClick={open} title="Edit" type="button">
        <PencilSquareIcon className="size-5" />
        Edit
      </Button>
    </>
  );
}
