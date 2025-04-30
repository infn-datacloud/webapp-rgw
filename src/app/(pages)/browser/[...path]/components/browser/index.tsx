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
import { useState } from "react";

export type BucketBrowserProps = {
  bucket: string;
  filepath: string;
  listObjectOutput: ListObjectsV2CommandOutput;
};

export function Browser(props: Readonly<BucketBrowserProps>) {
  const { bucket, filepath, listObjectOutput } = props;

  const [selectedFolders, setSelectedFolders] = useState(
    new Map<string, CommonPrefix>()
  );
  const [selectedObjects, setSelectedObjects] = useState(
    new Map<string, _Object>()
  );

  const handleSelectFolder = (prefix: CommonPrefix, value: boolean) => {
    console.log(prefix, value);
    if (prefix.Prefix) {
      const newMap = new Map(selectedFolders);
      value ? newMap.set(prefix.Prefix, prefix) : newMap.delete(prefix.Prefix);
      setSelectedFolders(newMap);
    }
  };

  const handleSelectObject = (object: _Object, value: boolean) => {
    if (object.Key) {
      const newMap = new Map(selectedObjects);
      value ? newMap.set(object.Key, object) : newMap.delete(object.Key);
      setSelectedObjects(newMap);
    }
  };

  console.log(selectedObjects);

  return (
    <div>
      <Toolbar bucket={bucket} currentPath={filepath} objectsToDelete={[]} />
      <PathViewer currentPath={filepath} />
      <BucketInspector
        isOpen={selectedObjects.size > 0}
        bucket={bucket}
        objects={Array.from(selectedObjects.values())}
      />
      <ObjectTable
        listObjectsOutput={listObjectOutput}
        bucket={bucket}
        onSelectFolder={handleSelectFolder}
        onSelectObject={handleSelectObject}
      />
    </div>
  );
}
