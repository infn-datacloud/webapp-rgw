"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { BucketInspector } from "./BucketInspector";
import ObjectsTable from "./ObjectsTable";
import { initNodePathTree, makeTableData } from "../utils";
import { _Object } from "@aws-sdk/client-s3";
import Toolbar from "./Toolbar";
import { NodePath } from "@/commons/utils";
import PathViewer from "./PathViewer";
import { useRouter } from "next/navigation";

export type BucketBrowserProps = {
  bucket: string;
  bucketObjects: _Object[];
};

export default function BucketBrowser(props: Readonly<BucketBrowserProps>) {
  const { bucket, bucketObjects } = props;
  const root = useMemo(() => initNodePathTree(bucketObjects), [bucketObjects]);
  const lastNodePath = useRef<NodePath<_Object>>();
  const [currentPath, setCurrentPath] = useState(root);
  const router = useRouter();
  const [selectedObjectsKeys, setSelectedObjectsKeys] = useState(
    new Set<string>()
  );

  const selectedObjects = useMemo(
    () => bucketObjects.filter(o => selectedObjectsKeys.has(o.Key!)),
    [selectedObjectsKeys, bucketObjects]
  );

  const tableData = useMemo(
    () => makeTableData(currentPath, selectedObjectsKeys),
    [currentPath, selectedObjectsKeys]
  );

  const isInspectorOpen = useMemo(
    () => selectedObjects.length > 0,
    [selectedObjects]
  );

  lastNodePath.current = currentPath;

  useEffect(() => {
    if (lastNodePath.current) {
      const newLast = root.get(lastNodePath.current.path);
      newLast ? setCurrentPath(newLast) : setCurrentPath(root);
    } else {
      setCurrentPath(root);
      setSelectedObjectsKeys(new Set<string>());
    }
  }, [root, bucketObjects]);

  const handleCloseBucketInspector = () => {
    setSelectedObjectsKeys(new Set<string>());
  };

  const handleSelectedRow = (selected: boolean, index: number) => {
    const row = tableData.rows[index];
    const fileName = row.columns.get("name")!.value as string;
    const selectedNode = currentPath.get(fileName);
    if (!selectedNode) {
      console.warn("Selected node not found");
      return;
    }

    if (selectedNode.isDir) {
      return;
    }
    const key = selectedNode.path;
    selected ? selectedObjectsKeys.add(key) : selectedObjectsKeys.delete(key);
    setSelectedObjectsKeys(new Set(selectedObjectsKeys));
  };

  const handleClickedRow = (index: number) => {
    const row = tableData.rows[index];
    const name = row.columns.get("name")!.value as string;
    const newPath = currentPath.get(name);
    if (!newPath) {
      console.warn(`Path with name '${name}' not found`);
      return;
    }
    if (newPath.isDir) {
      setCurrentPath(newPath);
    } else {
      handleSelectedRow(!row.selected, index);
    }
  };

  const handlePathChange = (newPath: string) => {
    const newNode = new NodePath<_Object>(newPath);
    root.addChild(newNode);
    setCurrentPath(newNode);
  };

  const handleOnDeleted = () => {
    router.push(`/browser/${bucket}`);
    setSelectedObjectsKeys(new Set());
  };

  const handleGoBack = () => {
    const isEmpty = currentPath.children.size === 0;
    const newPath = currentPath.parent;
    if (newPath) {
      if (isEmpty) {
        newPath.removeChild(currentPath);
      }
      setCurrentPath(newPath);
    }
  };

  const handleQuerySearch = (query: string) => {
    const makeNewRoot = () => {
      const objects = bucketObjects.filter(o =>
        o.Key!.toLowerCase().includes(query)
      );
      return initNodePathTree(objects);
    };
    setCurrentPath(query ? makeNewRoot() : root);
  };

  return (
    <>
      <BucketInspector
        isOpen={isInspectorOpen}
        bucket={bucket}
        objects={selectedObjects}
        onClose={handleCloseBucketInspector}
        onDelete={handleOnDeleted}
      />
      <Toolbar
        bucket={bucket}
        currentPath={currentPath.path}
        objectsToDelete={Array.from(selectedObjectsKeys.keys())}
        onPathChange={handlePathChange}
        onDeleted={handleOnDeleted}
      />
      <PathViewer
        bucket={bucket}
        path={currentPath}
        onClickBackButton={handleGoBack}
        onQuerySearchChanged={handleQuerySearch}
      />
      <ObjectsTable
        data={tableData}
        onSelect={handleSelectedRow}
        onClick={handleClickedRow}
      />
    </>
  );
}
