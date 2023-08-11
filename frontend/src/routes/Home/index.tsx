import { Page } from '../../components/Page';
import { Table, Column } from '../../components/Table';
import { useSearchParams } from 'react-router-dom';
import { Bucket } from '@aws-sdk/client-s3';
import { useBucketStore } from '../../services/BucketStore';
import { BucketBrowser } from '../BucketBrowser';

export const Home = () => {
  const [serachParams, setSearchParams] = useSearchParams();
  const { bucketList } = useBucketStore();

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

  const onClick = (_: React.MouseEvent<HTMLTableRowElement>, index: number) => {
    const bucketName = bucketList[index].Name;
    if (bucketName) {
      setSearchParams(new URLSearchParams({ bucket: bucketName }));
    } else {
      console.warn("Bucket's Name is empty");
    }
  }

  const bucketName = serachParams.get("bucket");

  return (
    <Page title={bucketName ?? "Home"}>
      <div className="Home">
        <div className="flex place-content-center">
          <div className="flex w-2/3">
            {
              bucketName ?
                <BucketBrowser
                  bucketName={bucketName}
                /> :
                <Table
                  columns={columns}
                  data={tableData}
                  onClick={onClick}
                />
            }
          </div>
        </div>
      </div>
    </Page>
  );
}
