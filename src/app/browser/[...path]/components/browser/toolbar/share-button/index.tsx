// SPDX-FileCopyrightText: 2025 Istituto Nazionale di Fisica Nucleare
//
// SPDX-License-Identifier: EUPL-1.2

"use client";

import { Button } from "@/components/buttons";
import { ShareIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import { PresignedUrlModal } from "./modal";

type ShareButtonProps = {
  bucket: string;
  objectsToDownloads: string[];
};

export function ShareButton(props: Readonly<ShareButtonProps>) {
  const { bucket, objectsToDownloads } = props;
  const [show, setShow] = useState(false);
  const open = () => setShow(true);
  const close = () => setShow(false);
  return (
    <>
      <Button
        title="Share file"
        className="btn-secondary w-full justify-center"
        disabled={objectsToDownloads.length !== 1}
        onClick={open}
      >
        <ShareIcon className="size-5" />
        Share file
      </Button>
      <PresignedUrlModal
        bucket={bucket}
        object_key={objectsToDownloads[0]}
        show={show}
        onClose={close}
      />
    </>
  );
}
