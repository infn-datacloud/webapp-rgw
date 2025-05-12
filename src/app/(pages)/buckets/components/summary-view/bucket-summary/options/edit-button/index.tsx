"use client";

import { useState } from "react";
import { Button } from "@/components/buttons";
import { BucketConfiguration } from "@/models/bucket";
import { Bucket } from "@aws-sdk/client-s3";
import EditBucketModal from "./modal";

export default function EditBucketButton(props: {
  bucket: Bucket;
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
        className="text-primary hover:bg-primary hover:text-secondary btn-option"
        as="button"
        onClick={open}
        type="button"
      >
        Edit
      </Button>
    </>
  );
}
