"use client";
import { useState } from "react";
import EditBucketModal from "./EditBucketModal";
import { PencilSquareIcon } from "@heroicons/react/24/outline";
import { Button } from "@/components/Button";
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
      <Button
        className="my-auto pr-4"
        icon={<PencilSquareIcon />}
        onClick={open}
        title="Edit"
        type="button"
      />
    </>
  );
}
