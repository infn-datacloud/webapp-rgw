"use client";
import { useMemo, useRef } from "react";
import { BucketInspector } from "./BucketInspector";
import ObjectsTable from "./ObjectsTable";
import { TableData } from "@/components/Table";
import { initNodePathTree, makeTableData } from "./utils";
import { _Object } from "@aws-sdk/client-s3";
import Toolbar from "./Toolbar";

export type BucketBrowserProps = {
  bucket: string;
  bucketObjects: _Object[];
};

export default function BucketBrowser(props: BucketBrowserProps) {
  const { bucket, bucketObjects } = props;
  const selectedObjectsMap = useRef<Map<string, _Object>>(new Map());
  const selectedObjects = Array.from(selectedObjectsMap.current.values());
  const isInspectorOpen = selectedObjects.length > 0;
  const root = initNodePathTree(bucketObjects);
  let tableData: TableData = useMemo(() => {
    return makeTableData(root);
  }, [root]);
  const currentPath = "";

  const handleCloseBucketInspector = () => {};
  const handleDownloadFiles = () => {};
  const handleDeleteSelectedObject = () => {};
  const handleSelectedRow = (selected: boolean, index: number) => {};
  const handleClickedRow = (index: number) => {};

  return (
    <>
      <BucketInspector
        isOpen={isInspectorOpen}
        objects={selectedObjects}
        onClose={handleCloseBucketInspector}
        onDownload={handleDownloadFiles}
        onDelete={handleDeleteSelectedObject}
      />
      <Toolbar
        bucket={bucket}
        currentPath={currentPath}
        selectedObjects={selectedObjects}
      />
      <ObjectsTable
        data={tableData}
        onSelect={handleSelectedRow}
        onClick={handleClickedRow}
      />
    </>
  );
}
