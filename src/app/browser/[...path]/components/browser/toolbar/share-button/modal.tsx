// SPDX-FileCopyrightText: 2025 Istituto Nazionale di Fisica Nucleare
//
// SPDX-License-Identifier: EUPL-1.2

"use client";

import Modal, { ModalBody, ModalFooter, ModalProps } from "@/components/modal";
import { addHours } from "@/commons/utils";
import { NumberPicker } from "@/components/pickers/number";
import { useEffect, useState } from "react";
import { getPresignedUrl } from "./action";
import { Button } from "@/components/buttons";
import { ClipboardDocumentCheckIcon } from "@heroicons/react/24/outline";
import { toaster } from "@/components/toaster";

interface PresignedUrlModalProps extends ModalProps {
  bucket: string;
  object_key: string;
}

export function PresignedUrlModal(props: Readonly<PresignedUrlModalProps>) {
  const { bucket, object_key, ...other } = props;
  const [expiresInHours, setExpiresInHours] = useState<number>(1);
  const [expiration, setExpiration] = useState<Date>(addHours(new Date(), 1));
  const [presignedUrl, setPresignedUrl] = useState<string>();

  function handleHoursChange(hours: number) {
    setExpiresInHours(hours);
  }

  useEffect(() => {
    const f = async () => {
      const expiresIn = expiresInHours * 60;
      const url = await getPresignedUrl(bucket, object_key, expiresIn);
      setExpiration(addHours(new Date(), expiresInHours));
      setPresignedUrl(url);
    };
    f();
  }, [expiresInHours, bucket, object_key]);

  function copyToClipboard() {
    const type = "text/plain";
    const clipboardItemData = {
      [type]: presignedUrl ?? "",
    };
    const clipboardItem = new ClipboardItem(clipboardItemData);
    navigator.clipboard.write([clipboardItem]);
    toaster.info("Copied to clipboard");
  }

  return (
    <Modal title="Share file" {...other}>
      <ModalBody>
        <div className="space-y-4">
          <p>
            The following URL lets you to share this object without requiring
            authentication.
          </p>
          <p>
            It will automatically expires after your configured time (max 24
            hours).
          </p>
          <p>
            URL will expired at <b>{expiration.toUTCString()}</b>
          </p>
          <div className="flex items-center justify-center gap-2">
            <span>Expires in (hours):</span>
            <NumberPicker
              min={1}
              max={24}
              defaultValue={1}
              onChange={handleHoursChange}
            />
          </div>
          <div className="flex gap-2 rounded border border-gray-300 px-2">
            <input
              className="grow font-mono text-sm"
              defaultValue={presignedUrl}
              disabled
            />
            <Button
              title="Copy presigned URL"
              className="rounded-full p-2 hover:bg-gray-100 active:bg-gray-200"
              onClick={copyToClipboard}
            >
              <ClipboardDocumentCheckIcon className="size-5" />
            </Button>
          </div>
        </div>
      </ModalBody>
    </Modal>
  );
}
