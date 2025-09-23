// SPDX-FileCopyrightText: 2025 Istituto Nazionale di Fisica Nucleare
//
// SPDX-License-Identifier: EUPL-1.2

"use client";

import { getHumanSize } from "@/commons/utils";
import { FileObjectWithProgress } from "@/models/bucket";
import { XCircleIcon } from "@heroicons/react/24/outline";
import { useMemo, useRef } from "react";

interface ProgressBarProps {
  file: FileObjectWithProgress;
  onAbort?: (file: FileObjectWithProgress) => void;
}

export type ProgressElement = ProgressBarProps;

export default function ProgressBar(props: Readonly<ProgressBarProps>) {
  const { file, onAbort } = props;
  const progress = `${Math.round(Math.max(0.02, file.progress()) * 100)}%`;
  const loadedBytes = file.loaded();
  const loaded = getHumanSize(loadedBytes);
  const total = getHumanSize(file.size());
  const aborted = file.aborted();
  const completed = file.state() === "complete";
  const lastLoaded = useRef<number>(0);
  const lastTime = useRef<number>(Date.now()); // milliseconds

  const speed = useMemo(() => {
    const now = Date.now();
    let delta = now - lastTime.current;
    if (delta !== 0) {
      delta /= 1000;
      const deltaB = loadedBytes - lastLoaded.current;
      const speed = deltaB / delta;
      lastLoaded.current = loadedBytes;
      lastTime.current = now;
      return speed;
    }
    return 0;
  }, [loadedBytes]);

  function abort() {
    onAbort?.(file);
  }

  return (
    <div className="py-2">
      <p className="truncate text-base">{file.object.Key}</p>
      <div className="flex flex-row items-center">
        <div className="grow">
          <div
            className="h-2.5 w-full rounded-full bg-gray-200 data-[aborted=true]:animate-none data-[completed=true]:animate-none dark:bg-slate-700"
            data-completed={completed}
            data-aborted={aborted}
          >
            <div
              className="data-[aborted=true]:bg-danger data-[completed=true]:bg-success h-2.5 animate-pulse rounded-full bg-blue-500 data-[completed=true]:animate-none"
              style={{ width: aborted ? "100%" : progress }}
              data-completed={completed}
              data-aborted={aborted}
            />
          </div>
        </div>
        <button
          title={`Abort upload of ${file.object.Key}`}
          className="group not-disabled:hover:bg-danger/20 rounded-full"
          onClick={abort}
          type="button"
          disabled={completed}
        >
          <XCircleIcon className="text-danger group-disabled:text-danger/40 size-6 p-1" />
        </button>
      </div>
      <div>
        {completed ? (
          <p className="text-xs">Uploaded {total}</p>
        ) : (
          <p className="text-xs">
            {loaded} of {total} - <span>{getHumanSize(speed)}/s</span>
          </p>
        )}
      </div>
    </div>
  );
}
