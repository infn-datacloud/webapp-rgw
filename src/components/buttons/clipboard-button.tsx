// SPDX-FileCopyrightText: 2026 Istituto Nazionale di Fisica Nucleare
//
// SPDX-License-Identifier: EUPL-1.2

import { useRef } from "react";
import { ClipboardDocumentCheckIcon } from "@heroicons/react/24/outline";

import { Tooltip, useTooltip } from "@/components/tooltip";

type ClipboardButtonProps = {
  onClick: () => void;
};

export function ClipboardButton(props: Readonly<ClipboardButtonProps>) {
  const { onClick } = props;
  const buttonRef = useRef(null);
  const tooltip = useTooltip(buttonRef);
  return (
    <button
      className="cursor-pointer rounded-full p-1 hover:bg-neutral-300 dark:hover:bg-neutral-300/30"
      onClick={onClick}
      ref={buttonRef}
    >
      <ClipboardDocumentCheckIcon className="size-5" />
      <Tooltip {...tooltip}>Copy to clipboard</Tooltip>
    </button>
  );
}
