import { ChangeEvent, useCallback, useEffect, useRef, useState } from 'react';
import { Page } from '../../components/Page';
import { BucketObject } from '../../models/bucket';
import { Column, Table } from '../../components/Table';
import { getHumanSize } from '../../commons/utils';
import { Button } from '../../components/Button';
import {
  DocumentIcon,
  PhotoIcon,
  ArrowLeftIcon,
  FolderIcon,
  ArrowUpOnSquareIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import { useS3Service } from '../../services/S3Service';
import { InputFile } from '../../components/InputFile';
import {
  ListObjectsV2Command,
  PutObjectCommand,
  DeleteObjectCommand
} from '@aws-sdk/client-s3';


type PropsType = {
  bucketName: string
}

export const BucketBrowser = ({ bucketName }: PropsType) => {
  const [bucketObjects, setBucketObjects] = useState<BucketObject[]>([]);
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const s3 = useS3Service();
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>();
  const lockRef = useRef<boolean>(false);

  const columns: Column[] = [
    { id: "icon" },
    { id: "name", name: "Name" },
    { id: "last_modified", name: "Last Modified" },
    { id: "bucket_size", name: "Size" },
  ];

  const tableData = bucketObjects.map((bucket: BucketObject) => {
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
    }
    const bucketSize = bucket.Size ? getHumanSize(bucket.Size) : "N/A"
    return [
      { columnId: "icon", value: <Icon /> },
      { columnId: "name", value: name },
      { columnId: "last_modified", value: bucket.LastModified?.toString() ?? "N/A" },
      { columnId: "bucket_size", value: bucketSize },
    ]
  });

  const refreshBucketObjects = useCallback(() => {
    const f = async () => {
      if (!s3.isAuthenticated()) {
        return;
      }

      console.log("List Bucket objects...")

      const listObjCmd = new ListObjectsV2Command({ Bucket: bucketName });
      const response = await s3.client.send(listObjCmd);
      const { Contents } = response;

      if (Contents) {
        setBucketObjects(Contents);
      } else {
        console.warn("Warning: bucket looks empty.");
      }
    };

    f().catch(err => console.error(err));
  }, [s3, bucketName]);


  useEffect(() => {
    if (bucketObjects.length === 0 && !lockRef.current) {
      refreshBucketObjects()
    }
    return () => {
      lockRef.current = true;
    }
  }, [bucketObjects, s3, refreshBucketObjects])

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) {
      return;
    }

    if (!s3.isAuthenticated()) {
      console.warn(
        "Warning: cannot upload file because S3 service not authenticated"
      );
      return;
    }

    inputRef.current = e.target;
    const { files } = e.target;

    // Upload all files FIXME: use different approach for multiple files
    Array.from(files).forEach(file => {
      const putObjCmd = new PutObjectCommand({
        Bucket: bucketName,
        Body: file,
        Key: file.name
      });

      s3.client.send(putObjCmd)
        .then(() => {
          console.log("File uploaded");
          if (inputRef.current) {
            inputRef.current.files = null;
            inputRef.current.value = "";
          }
        })
        .then(refreshBucketObjects)
        .catch(err => console.error(err));
    });
  }

  const deleteObject = async (bucketName: string, key: string) => {
    const delObjCmd = new DeleteObjectCommand({ Bucket: bucketName, Key: key });
    try {
      await s3.client.send(delObjCmd);
      console.log(`Object with key ${key} deleted.`);
    } catch (err) {
      console.error(err);
    }
  }

  const onSelect = (el: ChangeEvent<HTMLInputElement>, index: number) => {
    const newState = new Set(selectedRows);
    if (el.target.checked) {
      newState.add(index);
    } else {
      newState.delete(index);
    }
    setSelectedRows(newState);
  }

  const deleteSelectedObjects = () => {
    // Queue all delete asynchronously
    let promises: Promise<void>[] = [];
    selectedRows.forEach(rowIndex => {
      const { Key } = bucketObjects[rowIndex];
      if (Key) {
        promises.push(deleteObject(bucketName, Key));
      }
    });
    // Wait untill all delete are done then refresh the UI.
    Promise.all(promises)
      .then(() => {
        setSelectedRows(new Set());
        refreshBucketObjects();
      });
  }

  return (
    <Page title={bucketName}>
      <Button
        title="Back"
        icon={<ArrowLeftIcon />}
        onClick={() => navigate(-1)}
      />
      <div className='container w-2/3'>
        <div className="flex mt-8 place-content-between">
          <div className='flex space-x-4'>
            <InputFile
              icon={<ArrowUpOnSquareIcon />}
              onChange={handleFileChange}
            />
          </div>
          <Button
            title="Delete file(s)"
            icon={<TrashIcon />}
            onClick={deleteSelectedObjects}
            disabled={selectedRows.size === 0}
          />
        </div>
        <div className="flex place-content-center mt-4">
          <Table
            selectable={true}
            columns={columns}
            data={tableData}
            onSelect={onSelect}
            selectedRows={selectedRows}
          />
        </div>
      </div>
    </Page>
  )
}