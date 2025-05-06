"use client";

import { _Object, CommonPrefix } from "@aws-sdk/client-s3";
import Paginator from "@/components/paginator";
import { FolderRow } from "./folder-row";
import { ObjectRow } from "./object-row";
import { CheckboxState } from "@/components/checkbox";

type ObjectTableProps = {
  bucket: string;
  objectsStates: CheckboxState<_Object>[];
  foldersStates: CheckboxState<CommonPrefix>[];
  nextContinuationToken?: string;
  showFullKeys?: boolean;
  onSelectFolder?: (state: CheckboxState<CommonPrefix>, value: boolean) => void;
  onSelectObject?: (state: CheckboxState<_Object>, value: boolean) => void;
};

export function ObjectTable(props: Readonly<ObjectTableProps>) {
  const {
    bucket,
    objectsStates,
    foldersStates,
    onSelectFolder,
    onSelectObject,
    nextContinuationToken,
    showFullKeys: showFullKey,
  } = props;

  return (
    <div className="rounded bg-slate-100 text-sm text-primary shadow-md">
      <div className="flex px-4 pb-2 pt-6">
        <div className="min-w-8" />
        <div className="grow font-bold">Name</div>
        <div className="min-w-80 font-bold">Last Modified</div>
        <div className="min-w-20 font-bold">Size</div>
      </div>
      <ul className="bg-white">
        {foldersStates?.map(state => (
          <FolderRow
            key={state.underlying.Prefix}
            state={state}
            bucket={bucket}
            onChange={onSelectFolder}
          />
        ))}
        {objectsStates?.map(state => (
          <ObjectRow
            key={state.underlying.Key}
            state={state}
            showFull={showFullKey}
            onChange={onSelectObject}
          />
        ))}
      </ul>
      <Paginator nextContinuationToken={nextContinuationToken} />
    </div>
  );
}
