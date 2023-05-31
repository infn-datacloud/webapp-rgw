import { BucketObject } from "../../models/bucket";
import { NodePath, addPath, getHumanSize } from "../../commons/utils";
import { S3ContextProps } from "../../services/S3Service";
import {
  DeleteObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand
} from "@aws-sdk/client-s3";
import {
  DocumentIcon,
  FolderIcon,
  PhotoIcon
} from "@heroicons/react/24/outline";
import { Value } from "../../components/Table";

export const initNodePathTree = (bucketObjects: BucketObject[], node: NodePath<BucketObject>) => {
  bucketObjects.forEach(object => {
    if (object.Key) {
      addPath(object.Key, node, object);
    } else {
      console.warn("Warning: object has empty Key.")
    }
  });
}

export const getTableData = (nodePath: NodePath<BucketObject>): Value[][] => {
  return nodePath.children.map(child => {
    const isFolder = child.children.length > 0;
    const ext = child.basename.includes(".") ? child.basename.split(".")[1] : ""
    const getIcon = () => {
      if (isFolder) return <FolderIcon />;
      switch (ext) {
        case "png":
        case "jpeg":
        case "jpg":
          return <PhotoIcon />;
        default:
          return <DocumentIcon />
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

    return [
      { columnId: "icon", value: <Icon /> },
      { columnId: "name", value: child.basename },
      { columnId: "last_modified", value: child.value?.LastModified?.toString() ?? "N/A" },
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
  objects: BucketObject[]) => {
  for (const object of objects) {
    try {
      const url = await s3.getPresignedUrl(bucketName, object.Key!);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', object.Key!);
      link.setAttribute('id', object.Key!);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
    }
  }
}

export const uploadFiles = (s3: S3ContextProps,
  bucketName: string, files: FileList, prefix?: string) => {
  const requests = Array.from(files).map(file => {
    const putObjCmd = new PutObjectCommand({
      Bucket: bucketName,
      Body: file,
      Key: prefix ? prefix + '/' + file.name : file.name
    });
    return s3.client.send(putObjCmd);
  });
  return Promise.all(requests);
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