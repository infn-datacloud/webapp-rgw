// SPDX-FileCopyrightText: 2025 Istituto Nazionale di Fisica Nucleare
//
// SPDX-License-Identifier: EUPL-1.2

"use client";

import { getHumanSize } from "@/commons/utils";
import { _Object } from "@aws-sdk/client-s3";
import { Checkbox, CheckboxState } from "@/components/checkbox";
import { dateToHuman } from "@/commons/utils";
import { FileIcon } from "./file-icon";
import { ClockIcon } from "@heroicons/react/24/outline";

type ObjectRowProps = {
  state: CheckboxState<_Object>;
  showFull?: boolean;
  onChange?: (state: CheckboxState<_Object>, value: boolean) => void;
};

export function ObjectRow(props: Readonly<ObjectRowProps>) {
  const { state, showFull, onChange } = props;
  const object = state.underlying;
  const lastModified = object.LastModified
    ? dateToHuman(object.LastModified)
    : "N/A";
  const fileName = showFull ? object.Key : object.Key?.split("/").splice(-1);
  const extension = object.Key?.split(".").slice(-1)[0];
  const size = object.Size ? getHumanSize(object.Size) : "N/A";

  const toggle = () => {
    onChange?.(state, !state.checked);
  };

  return (
    <li className="text-primary dark:text-secondary border-b border-slate-200 bg-white hover:bg-slate-100 dark:border-white/30 dark:bg-slate-800 dark:hover:bg-slate-700">
      <button
        className="flex w-full items-center gap-2 px-4 py-2 text-left"
        onClick={toggle}
      >
        <Checkbox checked={state.checked} />
        <div className="min-w-8">
          <FileIcon extension={extension} />
        </div>

        <div className="flex w-full flex-col sm:flex-row">
          <div className="my-auto flex grow flex-row sm:flex-col">
            {fileName}
          </div>
          <div className="flex flex-row gap-x-2 sm:flex-col">
            <div className="inline-flex sm:justify-end">
              <span className="text-sm font-bold">{size}</span>
            </div>
            <span className="dark:text-secondary/60 flex items-center justify-end gap-1 text-slate-500">
              <ClockIcon className="size-4" />
              <small className="font-light">{lastModified}</small>
            </span>
          </div>
        </div>
      </button>
    </li>
  );
}
