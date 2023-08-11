import { BucketObject, BucketObjectWithProgress, FileObjectWithProgress } from "../../models/bucket";
import { NodePath, addPath, getHumanSize } from "../../commons/utils";
import { S3ContextProps } from "../../services/S3Service";
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
import JSZip from 'jszip';
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

interface BlobFile {
  name: string,
  blob: Blob
}

const zipBlobs = (blobs: BlobFile[]) => {
  const zip = new JSZip();
  blobs.forEach(o => {
    zip.file(o.name, o.blob);
  });
  return zip.generateAsync({ type: "blob" });
}

const downloadFile = async (name: string, blob: Blob) => {
  try {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', name);
    link.setAttribute('id', name);
    document.body.appendChild(link);
    link.click();
    link.parentNode?.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (err) {
    console.error(err);
  }
}


export const downloadFiles = async (s3: S3ContextProps, bucketName: string,
  objects: BucketObjectWithProgress[], onChange?: () => void) => {
  const { downloadObject } = s3;

  let blobs = await Promise.all(objects.map(o => {
    return downloadObject(bucketName, o, onChange);
  }));

  const blobsMap = blobs.map((b, i) => {
    return { name: objects[i].object.Key!, blob: b };
  });

  const result = await zipBlobs(blobsMap);
  const now = new Date();
  const filename = `${now.toISOString()}.zip`.replaceAll(":", "-");

  downloadFile(filename, result);
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
