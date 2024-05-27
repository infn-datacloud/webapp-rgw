import { NodePath, getHumanSize } from "@/commons/utils";
import {
  Cell,
  Column,
  ColumnId,
  Row,
  TableData,
} from "@/components/Table/types";
import { _Object } from "@aws-sdk/client-s3";
import FileIcon from "./components/FileIcon";
import IsomorphicDate from "@/components/IsomorphicDate";

export function initNodePathTree(bucketObjects: _Object[]): NodePath<_Object> {
  const root = new NodePath<_Object>("");
  bucketObjects.forEach(object => {
    let path = object.Key!;
    const pathElements = path.split("/");
    const basename = pathElements.pop();
    const lastModified = object.LastModified;
    path = pathElements.length > 0 ? pathElements.join("/") : "";
    root.addChild(
      new NodePath(basename ?? "unknown", object, object.Size, lastModified),
      path
    );
  });
  return root;
}

function computeRow(node: NodePath<_Object>, selected: boolean = false): Row {
  const Icon = () => {
    const elements = node.basename.split(".");
    const ext = node.isDir ? "folder" : elements[elements.length - 1];
    return <FileIcon extension={ext} />;
  };
  // const lastModified = moment(node.lastModified).calendar() ?? "N/A";
  const lastModified = node.lastModified.toUTCString();
  const columns = new Map<ColumnId, Cell>([
    ["icon", { value: <Icon /> }],
    ["name", { value: node.basename }],
    ["last_modified", { value: <IsomorphicDate time={lastModified} /> }],
    ["bucket_size", { value: getHumanSize(node.size) }],
  ]);
  return {
    selected,
    columns,
  };
}

export const makeTableData = (
  nodePath: NodePath<_Object>,
  selectedObjects: Set<string>
): TableData => {
  const cols: Column[] = [
    { id: "icon" },
    { id: "name", name: "Name" },
    { id: "last_modified", name: "Last Modified" },
    { id: "bucket_size", name: "Size" },
  ];
  const children = Array.from(nodePath.children.values());
  const rows: Row[] = children.map(child => {
    const key = child.path; // `${child.isDir ? "path:" : ""}${child.path}`;
    const selected = selectedObjects.has(key);
    return computeRow(child, selected);
  });

  return {
    cols,
    rows,
  };
};
