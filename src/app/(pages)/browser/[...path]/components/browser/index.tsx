// SPDX-FileCopyrightText: 2025 Istituto Nazionale di Fisica Nucleare
//
// SPDX-License-Identifier: EUPL-1.2

"use client";

import { ObjectTable } from "./table";
import Toolbar from "./toolbar";
import { BucketInspector } from "./toolbar/inspector";
import {
  _Object,
  CommonPrefix,
  ListObjectsV2CommandOutput,
} from "@aws-sdk/client-s3";
import { CheckboxState } from "@/components/checkbox";
import { useState } from "react";

function initObjectStates(contents?: _Object[]) {
  if (!contents) {
    return [];
  }
  return contents.map((content, index) => {
    return {
      checked: false,
      underlying: content,
      index,
    };
  });
}

function initFolderStates(commonPrefixes?: CommonPrefix[]) {
  if (!commonPrefixes) {
    return [];
  }
  return commonPrefixes.map((commonPrefix, index) => {
    return {
      checked: false,
      underlying: commonPrefix,
      index,
    };
  });
}

export type BucketBrowserProps = {
  bucket: string;
  filepath: string;
  prefix?: string;
  listObjectOutput: ListObjectsV2CommandOutput;
  showFullKeys?: boolean;
};

type ObjectsState = CheckboxState<_Object>;
type FolderState = CheckboxState<CommonPrefix>;

export function Browser(props: Readonly<BucketBrowserProps>) {
  const { bucket, filepath, prefix, listObjectOutput, showFullKeys } = props;
  const { Contents, CommonPrefixes, NextContinuationToken } = listObjectOutput;

  const [foldersStates, setFolderStates] = useState(
    initFolderStates(CommonPrefixes)
  );
  const [objectsStates, setObjectsStates] = useState(
    initObjectStates(Contents)
  );

  const handleSelectFolder = (folderState: FolderState, value: boolean) => {
    foldersStates[folderState.index].checked = value;
    setFolderStates([...foldersStates]);
  };

  const handleSelectObject = (objectState: ObjectsState, value: boolean) => {
    objectsStates[objectState.index].checked = value;
    setObjectsStates([...objectsStates]);
  };

  const deselectAll = () => {
    setFolderStates(initFolderStates(listObjectOutput.CommonPrefixes));
    setObjectsStates(initObjectStates(listObjectOutput.Contents));
  };

  const selectedObjects = objectsStates
    .filter(state => state.checked)
    .map(state => state.underlying);

  const selectedPrefixes = foldersStates
    .filter(state => state.checked)
    .map(state => state.underlying);

  return (
    <div className="space-y-2">
      <Toolbar bucket={bucket} currentPath={filepath} prefix={prefix} />
      <BucketInspector
        isOpen={selectedObjects.length + selectedPrefixes.length > 0}
        bucket={bucket}
        objects={selectedObjects}
        prefixes={selectedPrefixes}
        onClose={deselectAll}
      />
      <ObjectTable
        bucket={bucket}
        objectsStates={objectsStates}
        foldersStates={foldersStates}
        onSelectFolder={handleSelectFolder}
        onSelectObject={handleSelectObject}
        nextContinuationToken={NextContinuationToken}
        showFullKeys={showFullKeys}
      />
    </div>
  );
}
