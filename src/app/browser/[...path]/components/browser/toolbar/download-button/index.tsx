// SPDX-FileCopyrightText: 2025 Istituto Nazionale di Fisica Nucleare
//
// SPDX-License-Identifier: EUPL-1.2

import { useState } from "react";
import { ArrowDownCircleIcon } from "@heroicons/react/24/outline";

import { Button } from "@/components/buttons";
import { toaster } from "@/components/toaster";
import { DownloadModal } from "./modal";
import { generateCLICommand, getPresignedUrl } from "./actions";

export default function DownloadButton(props: {
  bucket: string;
  prefix: string;
  objectsToDownload: string[];
  foldersToDownload: string[];
  onComplete?: () => void;
}) {
  const {
    bucket, //
    objectsToDownload,
    foldersToDownload,
    onComplete,
  } = props;

  const [show, setShow] = useState(false);
  const [command, setCommand] = useState<string[] | null>(null);
  const buttonEnabled = objectsToDownload.length + foldersToDownload.length > 0;

  function openModal() {
    setShow(true);
  }

  function closeModal() {
    setShow(false);
    onComplete?.();
    setTimeout(() => {
      setCommand(null);
    }, 300);
  }

  async function downloadObject(key: string) {
    try {
      const url = await getPresignedUrl(bucket, key);
      const a = document.createElement("a");
      a.href = url;
      a.download = key;
      a.target = "_self";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      console.error(err);
      let message = "Unknown Error";
      if (err instanceof Error) {
        switch (err.message) {
          case "AccessDenied":
            message = "Access Denied";
          default:
        }
      }
      toaster.danger("Cannot download file(s)", message);
    }
  }

  async function getCliCommand() {
    setCommand(
      await generateCLICommand(bucket, objectsToDownload, foldersToDownload)
    );
    openModal();
  }

  function handleClick() {
    if (objectsToDownload.length === 1 && foldersToDownload.length === 0) {
      onComplete?.(); // close the drawer before opening the file
      downloadObject(objectsToDownload[0]);
    } else {
      getCliCommand();
    }
  }

  return (
    <>
      <Button
        title="Download file(s)"
        onClick={handleClick}
        disabled={!buttonEnabled}
        className="btn-primary w-full justify-center"
      >
        <ArrowDownCircleIcon className="size-5" />
        Download files(s)
      </Button>
      <DownloadModal
        show={show}
        onClose={closeModal}
        commands={command ?? []}
      />
    </>
  );
}
