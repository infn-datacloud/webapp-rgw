"use client";

import {
  _Object,
  CommonPrefix,
  ListObjectsV2CommandOutput,
} from "@aws-sdk/client-s3";
import Paginator from "@/components/paginator";
import { FolderRow } from "./folder-row";
import { ObjectRow } from "./object-row";

type ObjectTableProps = {
  listObjectsOutput: ListObjectsV2CommandOutput;
  bucket: string;
  onSelectFolder?: (prefix: CommonPrefix, value: boolean) => void;
  onSelectObject?: (object: _Object, value: boolean) => void;
};

export function ObjectTable(props: Readonly<ObjectTableProps>) {
  const { listObjectsOutput, bucket, onSelectFolder, onSelectObject } = props;
  const { Contents, CommonPrefixes, NextContinuationToken } = listObjectsOutput;

  return (
    <div className="rounded bg-slate-100 text-sm text-primary shadow-md">
      <div className="flex px-4 pb-2 pt-6">
        <div className="min-w-8" />
        <div className="grow font-bold">Name</div>
        <div className="min-w-80 font-bold">Last Modified</div>
        <div className="min-w-20 font-bold">Size</div>
      </div>
      <ul className="bg-white">
        {CommonPrefixes?.map(prefix => (
          <FolderRow
            key={prefix.Prefix}
            prefix={prefix}
            bucket={bucket}
            onChange={value => onSelectFolder?.(prefix, value)}
          />
        ))}
        {Contents?.map(object => (
          <ObjectRow
            key={object.Key}
            object={object}
            onChange={value => onSelectObject?.(object, value)}
          />
        ))}
      </ul>
      <Paginator nextContinuationToken={NextContinuationToken} />
    </div>
  );
}
