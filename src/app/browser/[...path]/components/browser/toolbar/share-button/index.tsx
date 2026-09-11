// SPDX-FileCopyrightText: 2025 Istituto Nazionale di Fisica Nucleare
//
// SPDX-License-Identifier: EUPL-1.2

"use client";

import { Button } from "@/components/buttons";
import { ShareIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import { PresignedUrlModal } from "./modal";
import { getPresignedUrl } from "./action";

type ShareButtonProps = {
  bucket: string;
  object: string;
  enabled: boolean;
  onClose: () => void;
};

export function ShareButton(props: Readonly<ShareButtonProps>) {
  const { bucket, object, enabled, onClose } = props;
  const [show, setShow] = useState(false);

  const [presignedUrl, setPresignedUrl] = useState<string>("");
  async function fetchPresignedUrl(expiresIn: number) {
    const url = await getPresignedUrl(bucket, object, expiresIn);
    setPresignedUrl(url);
  }
  async function openModal() {
    await fetchPresignedUrl(3600);
    setShow(true);
  }

  function closeModal() {
    setShow(false);
    onClose?.();
    setTimeout(() => setPresignedUrl(""), 300);
  }

  return (
    <>
      <Button
        title="Share file"
        className="btn-secondary w-full justify-center"
        disabled={!enabled}
        onClick={openModal}
      >
        <ShareIcon className="size-5" />
        Share file
      </Button>
      <PresignedUrlModal
        bucket={bucket}
        object={object}
        show={show}
        presignedUrl={presignedUrl}
        onClose={closeModal}
        onChangeExpiresIn={fetchPresignedUrl}
      />
    </>
  );
}
