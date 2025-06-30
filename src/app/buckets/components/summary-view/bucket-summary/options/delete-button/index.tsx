// SPDX-FileCopyrightText: 2025 Istituto Nazionale di Fisica Nucleare
//
// SPDX-License-Identifier: EUPL-1.2

"use client";

import { useState } from "react";
import { Bucket } from "@aws-sdk/client-s3";
import { Button } from "@/components/buttons";
import { ConfirmationModal } from "./modal";

type DeleteBucketProps = {
  bucket: Bucket;
};

export default function DeleteBucketButton(props: Readonly<DeleteBucketProps>) {
  const { bucket } = props;
  const [show, setShow] = useState(false);
  const open = () => setShow(true);
  const close = () => setShow(false);

  return (
    <>
      <Button
        className="text-danger hover:bg-danger hover:text-secondary btn-option"
        as="button"
        title="Delete"
        onClick={open}
        type="button"
      >
        Delete
      </Button>
      <ConfirmationModal bucket={bucket} show={show} onClose={close} />
    </>
  );
}
