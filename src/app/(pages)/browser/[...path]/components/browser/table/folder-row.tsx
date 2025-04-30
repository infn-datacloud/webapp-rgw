"use client";

import { Checkbox } from "@/components/checkbox";
import { CommonPrefix } from "@aws-sdk/client-s3";
import { FileIcon } from "./file-icon";
import Link from "next/link";

type FolderRowProps = {
  bucket: string;
  prefix: CommonPrefix;
  onChange?: (value: boolean) => void;
};

export function FolderRow(props: Readonly<FolderRowProps>) {
  const { bucket, prefix, onChange } = props;
  const href = `/browser/${bucket}/${prefix.Prefix}`;
  const path = prefix.Prefix?.split("/");
  path?.pop();
  const folderName = path?.pop();

  return (
    <li className="flex gap-2 border-b border-slate-100 p-4 hover:bg-slate-100">
      <Checkbox onChange={onChange} />
      <Link className="flex w-full" href={href}>
        <div className="min-w-8">
          <FileIcon extension="folder" />
        </div>
        {folderName}
      </Link>
    </li>
  );
}
