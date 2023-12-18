import { Page } from '../../components/Page';
import { Table, Column, Row, TableData, ColumnId, Cell } from '../../components/Table';
import { useSearchParams } from 'react-router-dom';
import { Bucket } from '@aws-sdk/client-s3';
import { useBucketStore } from '../../services/BucketStore';
import { BucketBrowser } from '../BucketBrowser';

export const Home = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { buckets } = useBucketStore();

  const tableData: TableData = function () {
    const cols: Column[] = [
      { id: "bucket", name: "Bucket" },
      { id: "creation_date", name: "Creation Date" },
    ];
    const rows = buckets.map((bucket: Bucket): Row => {
      const cols = new Map<ColumnId, Cell>();
      cols.set("bucket", { value: bucket.Name ?? "N/A" });
      cols.set("creation_date", { value: bucket.CreationDate?.toString() ?? "N/A" });
      return {
        selected: false,
        columns: cols
      }
    });
    return { rows, cols };
  }();

  const onClick = (index: number) => {
    const bucketName = buckets[index].Name;
    if (bucketName) {
      setSearchParams(new URLSearchParams({ bucket: bucketName }));
    } else {
      console.warn("Bucket's Name is empty");
    }
  }

  const bucketName = searchParams.get("bucket");

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
