import { BucketObject, BucketObjectWithProgress, FileObjectWithProgress } from "../../models/bucket";
import { NodePath, getHumanSize } from "../../commons/utils";
import { S3ContextProps } from "../../services/S3/S3Context";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import {
  DocumentIcon,
  FolderIcon,
  PhotoIcon
} from "@heroicons/react/24/outline";
import { Value } from "../../components/Table";
import moment from "moment";

export const initNodePathTree = (bucketObjects: BucketObject[],
  node: NodePath<BucketObject>) => {
  bucketObjects.forEach(object => {
    let path = object.Key;
    const pathElements = path.split("/");
    const basename = pathElements.pop();
    const lastModified = object.LastModified ?
      new Date(object.LastModified) : undefined;
    path = pathElements.length > 0 ? pathElements.join("/") : "";
    node.addChild(new NodePath(basename ?? "unknown",
      object, object.Size, lastModified), path);
  });
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

export const downloadFiles = async (s3: S3ContextProps, bucketName: string,
  objects: BucketObjectWithProgress[]) => {
  const { getPresignedUrl } = s3;
  const keys = objects.map(el => el.object.Key);
  const urlPromises = objects.map(el => {
    return getPresignedUrl(bucketName, el.object.Key);
  });

  const urls = await Promise.all(urlPromises)
    .then(contents => {
      return contents.map((url, i) => {
        return { key: keys[i], url: url };
      })
    });

  const link = document.createElement("a");
  link.onclick = () => {
    urls.map(el => window.open(el.url, "_blank"));
  }
  document.body.appendChild(link);
  link.click();
  link.parentNode?.removeChild(link);
}

export const uploadFiles = async (s3: S3ContextProps, bucketName: string,
  objects: FileObjectWithProgress[], onChange?: () => void) => {
  const { uploadObject } = s3;
  return Promise.all(objects.map(o => {
    return uploadObject(bucketName, o, onChange);
  }));
}

const deleteObject = async (s3: S3ContextProps, bucketName: string, object: BucketObject) => {
  const delObjCmd = new DeleteObjectCommand({ Bucket: bucketName, Key: object.Key });
  try {
    await s3.client.send(delObjCmd);
    console.log(`Object with key ${object.Key} deleted.`);
  } catch (err) {
    console.error(err);
  }
}

export const deleteObjects = (s3: S3ContextProps, bucketName: string, objects: BucketObject[]) => {
  return Promise.all(objects.map(o => {
    return deleteObject(s3, bucketName, o);
  }));
}
