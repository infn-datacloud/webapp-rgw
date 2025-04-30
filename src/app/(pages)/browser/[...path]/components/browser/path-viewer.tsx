"use client";

import { _Object } from "@aws-sdk/client-s3";
import { ChevronUpIcon } from "@heroicons/react/24/solid";

function PathBackButton(props: Readonly<{ currentPath: string }>) {
  const { currentPath } = props;
  const isRoot = currentPath.split("/").pop() === "";
  const goBack = () => window.history.back();

  return (
    <button
      className="my-auto h-8 w-8 rounded-full p-[5px] text-primary transition-transform hover:bg-neutral-200 data-[root=true]:-rotate-90 dark:text-secondary dark:hover:bg-neutral-600"
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
      <div className="flex space-x-2 text-primary dark:text-secondary">
        <PathBackButton currentPath={currentPath} />
        <div className="my-auto font-bold">Current path:</div>
        <div className="my-auto">{currentPath}</div>
      </div>
    </div>
  );
}
