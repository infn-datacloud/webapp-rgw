// SPDX-FileCopyrightText: 2025 Istituto Nazionale di Fisica Nucleare
//
// SPDX-License-Identifier: EUPL-1.2

"use client";

import { Checkbox } from "@/components/checkbox";
import { CommonPrefix } from "@aws-sdk/client-s3";
import Link from "next/link";
import { FileIcon } from "./file-icon";

type FolderRowProps = {
  bucket: string;
  folder: CommonPrefix;
  index: number;
  checked: boolean;
  onChange?: (index: number, value: boolean) => void;
};

export function FolderRow(props: Readonly<FolderRowProps>) {
  const { bucket, folder, index, checked, onChange } = props;
  const href = `/browser/${bucket}/${folder.Prefix}`;
  const path = folder.Prefix?.split("/");
  path?.pop();
  const folderName = path?.pop();

  function handleChange(newValue: boolean) {
    onChange?.(index, newValue);
  }

  return (
    <li className="text-primary dark:text-secondary border-b border-slate-200 bg-white hover:bg-slate-100 dark:border-white/30 dark:bg-slate-800 dark:hover:bg-slate-700">
      <Link className="flex w-full items-center gap-2 p-4" href={href}>
        <Checkbox checked={checked} onChange={handleChange} />
        <FileIcon extension="folder" />
        {folderName}
      </Link>
    </li>
  );
}
