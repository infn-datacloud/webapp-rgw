import { BucketObject } from "../../models/bucket";
import { getHumanSize } from "../../commons/utils";
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

export const getTableData = (bucketObjects: BucketObject[], prefix?: string): Value[][] => {
  
  interface Accumlator {
    [name: string]: Value[]
  }

  const tempData = bucketObjects.reduce((acc: Accumlator, bucket: BucketObject) => {
    const { Key } = bucket;
    if (!Key) {
      console.warn("Warning: object has empty Key.")
      return acc;
    }

    let isFolder = false;
    let name = "N/A";
    let ext = "N/A";

    name = '/' + Key;
    if (prefix && prefix !== '/') {
      const re = new RegExp(`^${prefix}/`)
      name = name.replace(re, "");
    }

    isFolder = name.split("/").length > 2;
    name = isFolder ? name.split("/")[1] : name;
    ext = isFolder ? ext : name.split(".")[1]; // FIXME: bug if file has no extension?

    if (Object.keys(acc).includes(name)) {
      return acc;
    }

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

    const bucketSize = bucket.Size ? getHumanSize(bucket.Size) : "N/A";

    acc[name] = [
      { columnId: "icon", value: <Icon /> },
      { columnId: "name", value: name },
      { columnId: "last_modified", value: bucket.LastModified?.toString() ?? "N/A" },
      { columnId: "bucket_size", value: bucketSize },
    ]
    return acc;
  }, {});
  return Object.values(tempData);
}

export const listObjects = async (s3: S3ContextProps, bucketName: string) => {
  console.log("List Bucket objects")
  const listObjCmd = new ListObjectsV2Command({ Bucket: bucketName });
  const response = await s3.client.send(listObjCmd)
  return response.Contents;
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