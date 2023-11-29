import { BucketObject } from "../../models/bucket";
import { NodePath, getHumanSize } from "../../commons/utils";
import moment from "moment";
import { Value } from "../../components/Table";
import {
  DocumentIcon,
  FolderIcon,
  PhotoIcon
} from "@heroicons/react/24/outline";

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

export const getTableData = (nodePath: NodePath<BucketObject>): Value[][] => {
  return Array.from(nodePath.children.values()).map(child => {
    const isFolder = child.children.size > 0;
    const ext = child.basename.includes(".") ? child.basename.split(".")[1] : ""
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

    const Icon = () => {
      return (
        <div className='w-5'>
          {getIcon()}
        </div>
      )
    };

    const lastModified = moment(child.lastModified).calendar() ?? "N/A";

    return [
      { columnId: "icon", value: <Icon /> },
      { columnId: "name", value: child.basename },
      { columnId: "last_modified", value: lastModified },
      { columnId: "bucket_size", value: getHumanSize(child.size) }
    ]
  });
}
