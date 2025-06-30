// SPDX-FileCopyrightText: 2025 Istituto Nazionale di Fisica Nucleare
//
// SPDX-License-Identifier: EUPL-1.2

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
    <div className="text-primary dark:text-secondary rounded-xl bg-neutral-100 text-sm shadow-md dark:bg-slate-700">
      <span className="flex px-4 pt-8 pb-2 text-lg font-bold">Objects</span>
      <ul className="bg-secondary">
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
      <div className="p-4">
        <Paginator nextContinuationToken={nextContinuationToken} />
      </div>
    </div>
  );
}
