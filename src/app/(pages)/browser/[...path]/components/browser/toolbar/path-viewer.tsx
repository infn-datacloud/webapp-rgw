"use client";

import { _Object } from "@aws-sdk/client-s3";
import { ChevronUpIcon } from "@heroicons/react/24/solid";

function PathBackButton(props: Readonly<{ currentPath: string }>) {
  const { currentPath } = props;
  const isRoot = currentPath.split("/").pop() === "";
  const goBack = () => window.history.back();

  return (
    <button
      className="text-primary dark:text-secondary my-auto h-8 w-8 rounded-full p-[5px] transition-transform hover:bg-neutral-200 data-[root=true]:-rotate-90 dark:hover:bg-neutral-600"
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
    <div className="grid grid-cols-1 py-2 sm:grid-cols-2">
      <div className="text-primary dark:text-secondary flex items-center space-x-2">
        <PathBackButton currentPath={currentPath} />
        <span className="my-auto inline-block font-bold text-nowrap">
          Current path:
        </span>
        <span className="inline-block font-mono">{currentPath}</span>
      </div>
    </div>
  );
}
