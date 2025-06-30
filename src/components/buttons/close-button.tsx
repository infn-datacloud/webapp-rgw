// SPDX-FileCopyrightText: 2025 Istituto Nazionale di Fisica Nucleare
//
// SPDX-License-Identifier: EUPL-1.2

import { XMarkIcon } from "@heroicons/react/24/outline";

export default function CloseButton(props: Readonly<{ onClose: () => void }>) {
  const { onClose } = props;
  return (
    <button onClick={onClose}>
      <div
        className="w-6 p-[3px] bg-neutral-300 text-neutral-500
                   hover:bg-neutral-400 rounded-full"
        aria-label="close"
      >
        <XMarkIcon />
      </div>
    </button>
  );
}
