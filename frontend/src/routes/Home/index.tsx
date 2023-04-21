import { Page } from '../../components/Page';
import { Table, Column } from '../../components/Table';
import { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BucketListContext } from '../../services/BucketListContext';
import { Bucket } from '@aws-sdk/client-s3';
import { useS3Service } from '../../services/S3Service';

export const Home = () => {
  const navigate = useNavigate();
  const { bucketList, setBuckets } = useContext(BucketListContext);
  const { isAuthenticated, fetchBucketList } = useS3Service();

  const columns: Column[] = [
    { id: "bucket", name: "Bucket" },
    { id: "creation_date", name: "Creation Date" },
  ];

  const tableData = bucketList.map((bucket: Bucket) => {
    return [
      { columnId: "bucket", value: bucket.Name },
      { columnId: "creation_date", value: bucket.CreationDate?.toString() },
    ]
  });

  const fetchBuckets = async () => {
    try {
      const buckets = await fetchBucketList();
      setBuckets(buckets);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    if (isAuthenticated() && bucketList.length === 0) {
      fetchBuckets();
    }
  });

  const onClick = (_: React.MouseEvent<HTMLTableRowElement>, index: number) => {
    const bucketName = bucketList[index].Name;
    navigate("/" + bucketName)
    console.log(bucketName);
  }

  return (
    <Page title="Home">
      <div className="Home">
        <div className="flex place-content-center">
          <div className="flex w-2/3">
            <Table
              columns={columns}
              data={tableData}
              onClick={onClick}
            />
          </div>
        </div>
      </div>
    </Page>
  );
}
