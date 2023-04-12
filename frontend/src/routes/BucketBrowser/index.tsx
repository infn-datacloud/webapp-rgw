import { useEffect, useState } from 'react';
import { Page } from '../../components/Page';
import { BucketObject } from '../../models/bucket';
import APIService from '../../services/APIService';
import { Column, Table } from '../../components/Table';
import { getHumanSize } from '../../commons/utils';
import { Button } from '../../components/Button';
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import { useNavigate } from 'react-router-dom';

type PropsType = {
  bucketName: string
}

export const BucketBrowser = ({ bucketName }: PropsType) => {
  const [bucketObjects, setBucketObjects] = useState<BucketObject[]>([]);
  const navigate = useNavigate();

  const columns: Column[] = [
    { name: "Name", columnType: "string" },
    { name: "Last Modified", columnType: "string" },
    { name: "Size", columnType: "string" },
  ];

  const tableData = bucketObjects.map((bucket: BucketObject) => {
    return [
      { columnName: "Name", value: bucket.Key },
      { columnName: "Last Modified", value: bucket.LastModified },
      { columnName: "Size", value: getHumanSize(bucket.Size) },
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