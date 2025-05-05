"use client";

import HomeButton from "./home-button";
import UploadButton from "./upload-button";
import RefreshButton from "./refresh-button";
import NewPathButton from "./new-path-button";
import DeleteButton from "./delete-button";
import { _Object, CommonPrefix } from "@aws-sdk/client-s3";

export default function Toolbar(
  props: Readonly<{
    bucket: string;
    currentPath: string;
    prefix?: string;
    objectsToDelete: _Object[];
    foldersToDelete: CommonPrefix[];
    onPathChange?: (newPath: string) => void;
    onDeleted?: () => void;
  }>
) {
  const {
    bucket,
    currentPath,
    prefix,
    objectsToDelete,
    foldersToDelete,
    onPathChange,
    onDeleted,
  } = props;
  return (
    <div className="mt-8 grid grid-cols-1 sm:grid-cols-2">
      <div className="flex space-x-2 py-1">
        <HomeButton />
        <UploadButton bucket={bucket} prefix={prefix} />
        <RefreshButton />
      </div>
      <div className="flex space-x-2 py-1 sm:ml-auto sm:mr-0">
        <NewPathButton
          currentPath={currentPath}
          onPathChange={onPathChange}
        />
        <DeleteButton
          bucket={bucket}
          objectsToDelete={objectsToDelete}
          foldersToDelete={foldersToDelete}
          onDeleted={onDeleted}
        />
      </div>
    </div>
  );
}
