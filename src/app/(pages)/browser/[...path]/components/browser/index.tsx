"use client";

import { ObjectTable } from "./table";
import PathViewer from "./path-viewer";
import Toolbar from "./toolbar";
import { BucketInspector } from "./inspector";
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
  listObjectOutput: ListObjectsV2CommandOutput;
};

type ObjectsState = CheckboxState<_Object>;
type FolderState = CheckboxState<CommonPrefix>;

export function Browser(props: Readonly<BucketBrowserProps>) {
  const { bucket, filepath, listObjectOutput } = props;
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
    setObjectsStates(initObjectStates(listObjectOutput.Contents));
  };

  const selectedObjects = objectsStates
    .filter(state => state.checked)
    .map(state => state.underlying);

  return (
    <div>
      <Toolbar bucket={bucket} currentPath={filepath} objectsToDelete={[]} />
      <PathViewer currentPath={filepath} />
      <BucketInspector
        isOpen={selectedObjects.length > 0}
        bucket={bucket}
        objects={selectedObjects}
        onClose={deselectAll}
      />
      <ObjectTable
        bucket={bucket}
        objectsStates={objectsStates}
        foldersStates={foldersStates}
        onSelectFolder={handleSelectFolder}
        onSelectObject={handleSelectObject}
        nextContinuationToken={NextContinuationToken}
      />
    </div>
  );
}
