import { BucketObject, BucketObjectWithProgress, FileObjectWithProgress } from "../../models/bucket";
import { NodePath, addPath, getHumanSize, truncateString } from "../../commons/utils";
import { S3ContextProps } from "../../services/S3/service";
import {
  DeleteObjectCommand,
  ListObjectsV2Command,
} from "@aws-sdk/client-s3";
import {
  DocumentIcon,
  FolderIcon,
  PhotoIcon
} from "@heroicons/react/24/outline";
import { Value } from "../../components/Table";
import moment from "moment";

export const initNodePathTree = (bucketObjects: BucketObject[], node: NodePath<BucketObject>) => {
  bucketObjects.forEach(object => addPath(object.Key, node, object));
}

export const getTableData = (nodePath: NodePath<BucketObject>): Value[][] => {
  return nodePath.children.map(child => {
    const isFolder = child.children.length > 0;
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

    const bucketSize = child.children.length > 0 ? child.children.reduce((acc, c) => {
      return acc += c.value?.Size ?? 0;
    }, 0) : child.value?.Size ?? 0;
    const lastModified = moment(child.value?.LastModified).calendar() ?? "N/A";

    return [
      { columnId: "icon", value: <Icon /> },
      { columnId: "name", value: truncateString(child.basename, 32) },
      { columnId: "last_modified", value: lastModified },
      { columnId: "bucket_size", value: getHumanSize(bucketSize) },
    ]
  });
}

export const listObjects = async (s3: S3ContextProps, bucketName: string) => {
  console.log("List Bucket objects")
  const listObjCmd = new ListObjectsV2Command({ Bucket: bucketName });
  const response = await s3.client.send(listObjCmd)
  return response.Contents;
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
  let handles: (Window | null)[] = [];
  link.onclick = () => {
    handles = urls.map(el => window.open(el.url, "_blank"));
  }
  document.body.appendChild(link);
  link.click();
  link.parentNode?.removeChild(link);
  handles.forEach(handle => {
    setTimeout(() => handle?.close(), 500);
  });
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
