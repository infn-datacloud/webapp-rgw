// SPDX-FileCopyrightText: 2025 Istituto Nazionale di Fisica Nucleare
//
// SPDX-License-Identifier: EUPL-1.2

"use client";

import { Checkbox, CheckboxState } from "@/components/checkbox";
import { CommonPrefix } from "@aws-sdk/client-s3";
import { FileIcon } from "./file-icon";
import Link from "next/link";

type FolderRowProps = {
  bucket: string;
  state: CheckboxState<CommonPrefix>;
  onChange?: (state: CheckboxState<CommonPrefix>, value: boolean) => void;
};

export function FolderRow(props: Readonly<FolderRowProps>) {
  const { bucket, state, onChange } = props;
  const prefix = state.underlying;
  const href = `/browser/${bucket}/${prefix.Prefix}`;
  const path = prefix.Prefix?.split("/");
  path?.pop();
  const folderName = path?.pop();

  return (
    <li className="text-primary dark:text-secondary flex gap-2 border-b border-slate-200 bg-white p-4 hover:bg-slate-100 dark:border-white/30 dark:bg-slate-800 dark:hover:bg-slate-700">
      <Checkbox
        checked={state.checked}
        onChange={newValue => onChange?.(state, newValue)}
      />
      <Link className="flex w-full" href={href}>
        <div className="min-w-8">
          <FileIcon extension="folder" />
        </div>
        {folderName}
      </Link>
    </li>
  );
}
