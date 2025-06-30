// SPDX-FileCopyrightText: 2025 Istituto Nazionale di Fisica Nucleare
//
// SPDX-License-Identifier: EUPL-1.2

"use client";

import { _Object } from "@aws-sdk/client-s3";
import { ChevronUpIcon } from "@heroicons/react/24/solid";

function PathBackButton(props: Readonly<{ currentPath: string }>) {
  const { currentPath } = props;
  const isRoot = currentPath.split("/").pop() === "";
  const goBack = () => window.history.back();

  return (
    <button
      className="text-primary dark:text-secondary my-auto h-8 w-8 rounded-full bg-neutral-100 p-[5px] transition-transform hover:bg-neutral-200 data-[root=true]:-rotate-90 dark:bg-white/30 dark:hover:bg-neutral-600"
      onClick={goBack}
      type="button"
      data-root={isRoot}
    >
      <ChevronUpIcon />
    </button>
  );
}

interface PathViewerProps {
  currentPath: string;
}

export default function PathViewer(props: Readonly<PathViewerProps>) {
  const { currentPath } = props;
  return (
    <div className="text-primary dark:text-secondary flex items-center gap-2">
      <div className="inline-flex gap-1 py-4">
        <PathBackButton currentPath={currentPath} />
        <span className="my-auto inline-block font-bold text-nowrap">
          Current path:
        </span>
      </div>
      <span className="inline-block font-mono">{currentPath}</span>
    </div>
  );
}
