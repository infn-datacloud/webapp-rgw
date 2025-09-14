// SPDX-FileCopyrightText: 2025 Istituto Nazionale di Fisica Nucleare
//
// SPDX-License-Identifier: EUPL-1.2

"use client";

import { Checkbox } from "@/components/checkbox";
import Paginator from "@/components/paginator";
import { _Object, CommonPrefix } from "@aws-sdk/client-s3";
import { CloudArrowUpIcon } from "@heroicons/react/24/outline";
import { useCallback, useEffect, useState } from "react";
import { FolderRow } from "./folder-row";
import { ObjectRow } from "./object-row";

type ObjectTableProps = {
  bucket: string;
  prefix?: string;
  objects: _Object[];
  folders: CommonPrefix[];
  nextContinuationToken?: string;
  showFullKeys?: boolean;
  selectedAll?: boolean;
  selectedFolders?: Set<number>;
  selectedObjects?: Set<number>;
  onSelectAll?: (checked: boolean) => void;
  onSelectFolder?: (index: number, value: boolean) => void;
  onSelectObject?: (index: number, value: boolean) => void;
  onUpload?: (files: File[]) => void;
};

export function ObjectTable(props: Readonly<ObjectTableProps>) {
  const {
    bucket,
    objects,
    folders,
    selectedAll,
    selectedFolders,
    selectedObjects,
    onSelectFolder,
    onSelectObject,
    onSelectAll,
    onUpload,
    nextContinuationToken,
    showFullKeys: showFullKey,
  } = props;

  const [dragging, setDragging] = useState(false);

  const dragEnterHandler = useCallback(
    (event: DragEvent) => {
      event.preventDefault();
      if (!dragging) {
        if (event.dataTransfer) {
          event.dataTransfer.effectAllowed = "copy";
          event.dataTransfer.dropEffect = "copy";
        }
        setDragging(true);
      }
    },
    [dragging]
  );

  const dragLeaveHandler = useCallback(
    (event: DragEvent) => {
      event.preventDefault();
      event.stopPropagation();
      setDragging(false);
    },
    [setDragging]
  );

  const dropHandler = useCallback(
    (event: DragEvent) => {
      event.preventDefault();
      if (event.dataTransfer && onUpload) {
        const files = [];
        for (const item of event.dataTransfer.items) {
          if (item.kind === "file") {
            const file = item.getAsFile();
            if (file) {
              files.push(file);
            }
          }
          onUpload(files);
        }
      }
      setDragging(false);
    },
    [onUpload, setDragging]
  );

  useEffect(() => {
    window.addEventListener("dragover", e => {
      e.preventDefault();
    });
    window.addEventListener("drop", e => {
      e.preventDefault();
    });

    const dropZone = document.getElementById("drop-zone");
    window.addEventListener("dragenter", dragEnterHandler);
    dropZone?.addEventListener("dragleave", dragLeaveHandler);
    dropZone?.addEventListener("drop", dropHandler);

    return () => {
      window.removeEventListener("dragenter", dragEnterHandler);
      dropZone?.removeEventListener("dragleave", dragLeaveHandler);
      dropZone?.removeEventListener("drop", dropHandler);
    };
  }, [dragEnterHandler, dragLeaveHandler, dropHandler]);

  const handleSelectAllChange = (checked: boolean) => {
    onSelectAll?.(checked);
  };

  return (
    <>
      <div
        className="text-primary dark:text-secondary relative rounded-xl bg-neutral-100 text-sm shadow-md outline-offset-8 outline-neutral-400 data-[dragging=true]:outline-dashed dark:bg-slate-700"
        data-dragging={dragging}
      >
        <div className="flex items-center gap-2 p-4 pt-8 pb-2">
          <Checkbox
            title="Select all"
            checked={selectedAll}
            onChange={handleSelectAllChange}
          />
          <span
            className="flex text-lg font-bold data-[dragging=true]:blur"
            data-dragging={dragging}
          >
            Objects
          </span>
        </div>
        <ul
          className="bg-secondary data-[dragging=true]:blur"
          data-dragging={dragging}
        >
          {folders?.map((folder, index) => (
            <FolderRow
              key={folder.Prefix}
              bucket={bucket}
              folder={folder}
              index={index}
              checked={selectedFolders?.has(index) ?? false}
              onChange={onSelectFolder}
            />
          ))}
          {objects?.map((object, index) => (
            <ObjectRow
              key={object.Key}
              showFull={showFullKey}
              checked={selectedObjects?.has(index) ?? false}
              onChange={onSelectObject}
              index={index}
              object={object}
            />
          ))}
        </ul>
        <div className="p-4 data-[dragging=true]:blur" data-dragging={dragging}>
          <Paginator
            nextContinuationToken={nextContinuationToken}
            onClick={() => onSelectAll?.(false)}
          />
        </div>
        <div
          className="absolute inset-0 flex data-[dragging=false]:hidden"
          data-dragging={dragging}
        >
          <div className="m-auto flex flex-col items-center">
            <CloudArrowUpIcon className="size-24 text-gray-400 dark:text-gray-400" />
            <p className="text-2xl text-gray-500 dark:text-gray-300">
              Drop to upload your files
            </p>
          </div>
        </div>
      </div>
      <div
        id="drop-zone"
        className="absolute inset-0 z-30 bg-transparent data-[dragging=false]:hidden"
        data-dragging={dragging}
      />
    </>
  );
}
