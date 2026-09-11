// SPDX-FileCopyrightText: 2026 Istituto Nazionale di Fisica Nucleare
//
// SPDX-License-Identifier: EUPL-1.2

import { ClipboardDocumentCheckIcon } from "@heroicons/react/24/outline";

import Modal, { ModalBody, ModalProps } from "@/components/modal";
import { toaster } from "@/components/toaster";

type CliCommandProps = {
  commands: string[];
};

function CliCommand(props: Readonly<CliCommandProps>) {
  const { commands } = props;
  const [credentials, command] = commands;

  function copyToClipboard() {
    navigator.clipboard.writeText(credentials + command);
    toaster.info("Copied to clipboard");
  }

  return (
    <div className="rounded-xl bg-neutral-200 px-4 py-2">
      <div className="flex items-baseline justify-between">
        <span className="font-mono">Bash</span>
        <button
          className="rounded-full p-1 hover:bg-neutral-300"
          onClick={copyToClipboard}
        >
          <ClipboardDocumentCheckIcon className="size-5" />
        </button>
      </div>
      <div className="space-y-2">
        <div className="cursor-not-allowed">
          <p className="rounded-lg bg-neutral-100 p-2 font-mono text-sm" inert>
            {command.split(/\r?\n/).map((line, index) => {
              return (
                <span key={index} className="block py-0.5 pl-4 -indent-4">
                  {line}
                </span>
              );
            })}
          </p>
        </div>
        <small>
          <b>Note</b> use the copy-to-clipboard button to include credentials.
        </small>
      </div>
    </div>
  );
}

type DownloadModalProps = ModalProps & {
  commands: string[];
};

export function DownloadModal(props: Readonly<DownloadModalProps>) {
  const { commands, ...modalProps } = props;
  return (
    <Modal {...modalProps} title="Download objects">
      <ModalBody>
        <div className="space-y-4">
          <p>
            Only single file can be downloaded from the browser. To download
            multiple objects or folders use the following command:
          </p>
          <CliCommand commands={commands} />
        </div>
      </ModalBody>
    </Modal>
  );
}
