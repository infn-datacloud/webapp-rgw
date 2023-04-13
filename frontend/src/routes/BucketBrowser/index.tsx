import { useEffect, useState } from 'react';
import { Page } from '../../components/Page';
import { BucketObject } from '../../models/bucket';
import APIService from '../../services/APIService';
import { Column, Table } from '../../components/Table';
import { getHumanSize } from '../../commons/utils';
import { Button } from '../../components/Button';
import {
  DocumentIcon,
  PhotoIcon,
  ArrowLeftIcon,
  FolderIcon
} from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';

type PropsType = {
  bucketName: string
}

export const BucketBrowser = ({ bucketName }: PropsType) => {
  const [bucketObjects, setBucketObjects] = useState<BucketObject[]>([]);
  const navigate = useNavigate();

  const columns: Column[] = [
    { id: "icon" },
    { id: "name", name: "Name" },
    { id: "last_modified", name: "Last Modified" },
    { id: "bucket_size", name: "Size" },
  ];

  const tableData = bucketObjects.map((bucket: BucketObject) => {

    const isFolder = bucket.Key.includes("/");
    const name = isFolder ? bucket.Key.split("/").slice()[0] : bucket.Key;

    const getIcon = () => {
      if (isFolder) return <FolderIcon />;
      const extension = bucket.Key.split(".").slice(-1)[0];
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

    return [
      { columnId: "icon", value: <Icon /> },
      { columnId: "name", value: name },
      { columnId: "last_modified", value: bucket.LastModified },
      { columnId: "bucket_size", value: getHumanSize(bucket.Size) },
    ]
  });

  useEffect(() => {
    APIService.get(`/buckets/${bucketName}`)
      .then(result => setBucketObjects(result["buckets"]))
  }, [])

  return (
    <Page title={bucketName}>
      <Button
        title="Back"
        icon={<ArrowLeftIcon />}
        onClick={() => navigate(-1)}
      />
      <div className="flex place-content-center">
        <div className="flex w-2/3">
          <Table
            columns={columns}
            data={tableData}
          />
        </div>
      </div>
    </Page>
  )
}