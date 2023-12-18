import { BucketObject } from "../../models/bucket";
import { NodePath, getHumanSize } from "../../commons/utils";
import moment from "moment";
import {
  DocumentIcon,
  FolderIcon,
  PhotoIcon
} from "@heroicons/react/24/outline";
import { TableData, Row, Column, ColumnId, Cell } from "../../components/Table";

export const initNodePathTree = (bucketObjects: BucketObject[]) => {
  const root = new NodePath<BucketObject>("");
  bucketObjects.forEach(object => {
    let path = object.Key;
    const pathElements = path.split("/");
    const basename = pathElements.pop();
    const lastModified = object.LastModified ?
      new Date(object.LastModified) : undefined;
    path = pathElements.length > 0 ? pathElements.join("/") : "";
    root.addChild(new NodePath(basename ?? "unknown",
      object, object.Size, lastModified), path);
  });
  return root;
}

export const getTableData = (nodePath: NodePath<BucketObject>): TableData => {

  const cols: Column[] = [
    { id: "icon" },
    { id: "name", name: "Name" },
    { id: "last_modified", name: "Last Modified" },
    { id: "bucket_size", name: "Size" },
  ];

  const rows: Row[] = Array.from(nodePath.children.values()).map((child): Row => {
    const isFolder = child.children.size > 0;
    const ext = child.basename.includes(".") ? child.basename.split(".")[1] : ""
    
    const Icon = () => {
      const getIcon = () => {
        if (isFolder) return (<FolderIcon />);
        switch (ext) {
          case "png":
          case "jpeg":
          case "jpg":
            return (<PhotoIcon />);
          default:
            return (<DocumentIcon />);
        }
      }
      return (
        <div className='w-5'>
          {getIcon()}
        </div>
      )
    };

    const lastModified = moment(child.lastModified).calendar() ?? "N/A";
    const row: Row = {
      selected: false,
      columns: new Map<ColumnId, Cell>([
        ["icon", { value: <Icon /> }],
        ["name", { value: child.basename }],
        ["last_modified", { value: lastModified }],
        ["bucket_size", { value: getHumanSize(child.size) }]
      ])
    };
    return row;
  });

  return {
    cols,
    rows
  }
}
