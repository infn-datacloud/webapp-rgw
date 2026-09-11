// SPDX-FileCopyrightText: 2025 Istituto Nazionale di Fisica Nucleare
//
// SPDX-License-Identifier: EUPL-1.2

"use client";

import Modal, { ModalBody, ModalProps } from "@/components/modal";
import { addHours } from "@/commons/utils/dates";
import { NumberPicker } from "@/components/pickers/number";
import { useMemo, useState } from "react";
import { Button } from "@/components/buttons";
import { ClipboardDocumentCheckIcon } from "@heroicons/react/24/outline";
import { toaster } from "@/components/toaster";
import { getNow } from "@/commons/utils/dates";

interface PresignedUrlModalProps extends ModalProps {
  bucket: string;
  object: string;
  presignedUrl: string;
  onChangeExpiresIn: (expiresIn: number) => void;
}

export function PresignedUrlModal(props: Readonly<PresignedUrlModalProps>) {
  const { presignedUrl, onChangeExpiresIn, ...modalProps } = props;
  const [expiresInHours, setExpiresInHours] = useState<number>(1);
  const expiration = useMemo(
    () => addHours(getNow(), expiresInHours),
    [expiresInHours]
  );

  function handleHoursChange(hours: number) {
    setExpiresInHours(hours);
    const expiresIn = expiresInHours * 60;
    onChangeExpiresIn(expiresIn);
    console.log("expiration changed");
  }

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
    <Modal title="Share file" {...modalProps}>
      <ModalBody>
        <div className="space-y-4">
          <p>
            The following URL lets you to share this object without requiring
            authentication. It will automatically expires after your configured
            time (max 12 hours).
          </p>
          <div className="flex items-center justify-center gap-2">
            <span>Expires in (hours):</span>
            <NumberPicker
              min={1}
              max={12}
              defaultValue={1}
              onChange={handleHoursChange}
            />
          </div>
          <p className="text-center">
            URL will expire at <b>{expiration.toUTCString()}</b>
          </p>
          <div className="flex gap-2 rounded border border-gray-300 px-2">
            <input
              className="grow font-mono text-sm"
              value={presignedUrl}
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
