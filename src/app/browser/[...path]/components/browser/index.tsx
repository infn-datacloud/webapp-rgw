// SPDX-FileCopyrightText: 2025 Istituto Nazionale di Fisica Nucleare
//
// SPDX-License-Identifier: EUPL-1.2

"use client";

import { ListObjectsV2CommandOutput } from "@aws-sdk/client-s3";
import { useUploader } from "@/components/uploader";
import { useMemo, useState } from "react";
import { ObjectTable } from "./table";
import { BucketInspector } from "./toolbar/inspector";
import Toolbar from "./toolbar";

const INSPECTOR_CLOSE_DELAY = 200;

export type BucketBrowserProps = {
  bucket: string;
  filepath: string;
  prefix?: string;
  listObjectOutput: ListObjectsV2CommandOutput;
  showFullKeys?: boolean;
};

export function Browser(props: Readonly<BucketBrowserProps>) {
  const { bucket, filepath, prefix, listObjectOutput, showFullKeys } = props;
  const { NextContinuationToken } = listObjectOutput;
  const { upload } = useUploader();
  const [showInspector, setShowInspector] = useState(false);
  const [selectedAll, setSelectedAll] = useState(false);
  const [selectedObjectsIndexes, setSelectedObjectsIndexes] = useState<
    Set<number>
  >(new Set());
  const [selectedFoldersIndexes, setSelectedFoldersIndexes] = useState<
    Set<number>
  >(new Set());

  const folders = useMemo(() => {
    const { CommonPrefixes } = listObjectOutput;
    return CommonPrefixes ?? [];
  }, [listObjectOutput]);

  const objects = useMemo(() => {
    const { Contents } = listObjectOutput;
    return Contents ?? [];
  }, [listObjectOutput]);

  // we use this state as trick to delay checkbox deselection and prevent that
  // all checkbox are unchecked before the inspector is fully closed
  const openInspector = () => {
    if (!showInspector) {
      setShowInspector(true);
    }
  };

  const closeInspector = () => {
    setShowInspector(false);
  };

  function handleSelectFolder(index: number, checked: boolean) {
    const newSet = new Set(selectedFoldersIndexes);
    checked ? newSet.add(index) : newSet.delete(index);
    if (newSet.size + selectedObjectsIndexes.size > 0) {
      openInspector();
      setSelectedFoldersIndexes(newSet);
    } else {
      closeInspector();
      setTimeout(
        () => setSelectedFoldersIndexes(newSet),
        INSPECTOR_CLOSE_DELAY
      );
    }
  }

  function handleSelectObject(index: number, checked: boolean) {
    const newSet = new Set(selectedObjectsIndexes);
    checked ? newSet.add(index) : newSet.delete(index);
    if (newSet.size + selectedFoldersIndexes.size > 0) {
      openInspector();
      setSelectedObjectsIndexes(newSet);
    } else {
      closeInspector();
      setTimeout(
        () => setSelectedObjectsIndexes(newSet),
        INSPECTOR_CLOSE_DELAY
      );
    }
  }

  const selectAll = () => {
    openInspector();
    setSelectedFoldersIndexes(new Set([...Array(folders.length).keys()]));
    setSelectedObjectsIndexes(new Set([...Array(objects.length).keys()]));
    setSelectedAll(true);
  };

  const deselectAll = () => {
    closeInspector();
    setTimeout(() => {
      setSelectedAll(false);
      setSelectedFoldersIndexes(new Set());
      setSelectedObjectsIndexes(new Set());
    }, INSPECTOR_CLOSE_DELAY);
  };

  function handleOnSelectAll(checked: boolean) {
    checked ? selectAll() : deselectAll();
  }

  const selectedObjects =
    Array.from(selectedObjectsIndexes.values().map(i => objects[i])) ?? [];
  const selectedFolders =
    Array.from(selectedFoldersIndexes.values().map(i => folders[i])) ?? [];

  return (
    <div className="space-y-2">
      <Toolbar
        bucket={bucket}
        currentPath={filepath}
        prefix={prefix}
        onFilesReadyToUpload={file => upload(file, bucket, prefix ?? "")}
      />
      <BucketInspector
        isOpen={showInspector}
        bucket={bucket}
        objects={selectedObjects}
        prefixes={selectedFolders}
        onClose={deselectAll}
        onDelete={deselectAll}
      />
      <ObjectTable
        bucket={bucket}
        prefix={prefix}
        objects={objects}
        folders={folders}
        selectedAll={selectedAll}
        selectedFolders={selectedFoldersIndexes}
        selectedObjects={selectedObjectsIndexes}
        onSelectFolder={handleSelectFolder}
        onSelectObject={handleSelectObject}
        nextContinuationToken={NextContinuationToken}
        showFullKeys={showFullKeys}
        onUpload={file => upload(file, bucket, prefix ?? "")}
        onSelectAll={handleOnSelectAll}
      />
    </div>
  );
}
