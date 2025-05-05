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
import { useRouter } from "next/navigation";
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
};

type ObjectsState = CheckboxState<_Object>;
type FolderState = CheckboxState<CommonPrefix>;

export function Browser(props: Readonly<BucketBrowserProps>) {
  const { bucket, filepath, prefix, listObjectOutput } = props;
  const { Contents, CommonPrefixes, NextContinuationToken } = listObjectOutput;
  const router = useRouter();

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

  const handleDelete = () => {
    router.refresh();
  };

  return (
    <div>
      <Toolbar
        bucket={bucket}
        currentPath={filepath}
        prefix={prefix}
        objectsToDelete={selectedObjects}
        foldersToDelete={selectedPrefixes}
        onDeleted={handleDelete}
      />
      <PathViewer currentPath={filepath} />
      <BucketInspector
        isOpen={selectedObjects.length + selectedPrefixes.length > 0}
        bucket={bucket}
        objects={selectedObjects}
        prefixes={selectedPrefixes}
        onClose={deselectAll}
        onDelete={handleDelete}
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
