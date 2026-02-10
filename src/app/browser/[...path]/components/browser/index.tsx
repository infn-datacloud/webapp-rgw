// SPDX-FileCopyrightText: 2025 Istituto Nazionale di Fisica Nucleare
//
// SPDX-License-Identifier: EUPL-1.2

"use client";

import { ListObjectsV2CommandOutput } from "@aws-sdk/client-s3";
import { useMemo, useState } from "react";
import { ObjectTable } from "./table";
import { BucketInspector } from "./toolbar/inspector";
import Toolbar from "./toolbar";

const INSPECTOR_CLOSE_DELAY = 300;

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
  const [showInspector, setShowInspector] = useState(false);
  const [selectedAll, setSelectedAll] = useState(false);
  const [selectedIndexes, setSelectedIndexes] = useState<{
    objects: Set<number>;
    folders: Set<number>;
  }>({
    objects: new Set(),
    folders: new Set(),
  });

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

  function totalItems(items: { objects: Set<number>; folders: Set<number> }) {
    return items.objects.size + items.folders.size;
  }

  function handleSelectFolder(index: number, checked: boolean) {
    const folders = new Set(selectedIndexes.folders);
    checked ? folders.add(index) : folders.delete(index);
    const _selected = { ...selectedIndexes, folders };
    if (totalItems(_selected) > 0) {
      openInspector();
      setSelectedIndexes(_selected);
    } else {
      closeInspector();
      setTimeout(
        () => setSelectedIndexes({ ...selectedIndexes, folders }),
        INSPECTOR_CLOSE_DELAY
      );
    }
  }

  function handleSelectObject(index: number, checked: boolean) {
    const objects = new Set(selectedIndexes.objects);
    checked ? objects.add(index) : objects.delete(index);
    const _selected = { ...selectedIndexes, objects };
    if (totalItems(_selected)) {
      openInspector();
      setSelectedIndexes({ ...selectedIndexes, objects });
    } else {
      closeInspector();
      setTimeout(
        () => setSelectedIndexes({ ...selectedIndexes, objects }),
        INSPECTOR_CLOSE_DELAY
      );
    }
  }

  const selectAll = () => {
    openInspector();
    setSelectedIndexes({
      folders: new Set([...Array(folders.length).keys()]),
      objects: new Set([...Array(objects.length).keys()]),
    });
    setSelectedAll(true);
  };

  const deselectAll = () => {
    closeInspector();
    setTimeout(() => {
      setSelectedAll(false);
      setSelectedIndexes({
        folders: new Set(),
        objects: new Set(),
      });
    }, INSPECTOR_CLOSE_DELAY);
  };

  function handleOnSelectAll(checked: boolean) {
    checked ? selectAll() : deselectAll();
  }

  const selectedItems = {
    folders:
      Array.from(selectedIndexes.folders.values().map(i => folders[i])) ?? [],
    objects:
      Array.from(selectedIndexes.objects.values().map(i => objects[i])) ?? [],
  };

  return (
    <div className="space-y-2">
      <Toolbar bucket={bucket} currentPath={filepath} prefix={prefix} />
      <BucketInspector
        isOpen={showInspector}
        bucket={bucket}
        objects={selectedItems.objects}
        prefixes={selectedItems.folders}
        onClose={deselectAll}
        onDelete={deselectAll}
      />
      <ObjectTable
        bucket={bucket}
        prefix={prefix}
        objects={objects}
        folders={folders}
        selectedAll={selectedAll}
        selectedFolders={selectedIndexes.folders}
        selectedObjects={selectedIndexes.objects}
        onSelectFolder={handleSelectFolder}
        onSelectObject={handleSelectObject}
        nextContinuationToken={NextContinuationToken}
        showFullKeys={showFullKeys}
        onSelectAll={handleOnSelectAll}
      />
    </div>
  );
}
