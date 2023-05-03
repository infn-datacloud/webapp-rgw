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

export const getTableData = (bucketObjects: BucketObject[]) => {
  return bucketObjects.map((bucket: BucketObject) => {
    const { Key } = bucket;

    const isFolder = Key?.includes("/") || false;
    const [name, extension] = (() => {
      if (Key) {
        const name = isFolder ? Key.split("/").slice()[0] : bucket.Key;
        const ext = Key.split(".").slice(-1)[0];
        return [name, ext];
      }
      return ["N/A", "N/A"];
    })();

    const getIcon = () => {
      if (isFolder) return <FolderIcon />;
      switch (extension) {
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

    return [
      { columnId: "icon", value: <Icon /> },
      { columnId: "name", value: name },
      { columnId: "last_modified", value: bucket.LastModified?.toString() ?? "N/A" },
      { columnId: "bucket_size", value: bucketSize },
    ]
  });
}

export const listObjects = async (s3: S3ContextProps, bucketName: string) => {
  console.log("List Bucket objects")
  const listObjCmd = new ListObjectsV2Command({ Bucket: bucketName });
  const response = await s3.client.send(listObjCmd)
  return response.Contents;
}

export const uploadFiles = (s3: S3ContextProps, bucketName: string, files: FileList) => {
  const requests = Array.from(files).map(file => {
    const putObjCmd = new PutObjectCommand({
      Bucket: bucketName,
      Body: file,
      Key: file.name
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