import { Page } from '../../components/Page';
import { Table } from '../../components/Table';
import { useContext } from 'react';
import { BucketInfo } from '../../models/bucket';
import { getHumanSize, parseReadWriteAccess } from '../../commons/utils';
import { BucketsListContext } from '../../services/BucketListContext';
import './index.css';

export const Home = () => {

  const onClick = (element: React.MouseEvent<HTMLTableRowElement>, index: number) => {
    const bucketName = element.currentTarget.firstChild?.textContent;
    console.log(bucketName);
  }

  const columns = ["Bucket", "Objects", "Size", "Access"];

  const bucketList = useContext(BucketsListContext).map((bucket: BucketInfo) => {
    return [
      bucket.name,
      bucket.objects,
      getHumanSize(bucket.size),
      parseReadWriteAccess(bucket.rw_access)
    ]
  });

  return (
    <Page title="Home">
      <div className="Home">
        <div className="flex place-content-center">
          <Table
            className="table-auto w-2/3"
            columns={columns}
            data={bucketList}
            onClick={onClick}
          />
        </div>
      </div>
    </Page>
  );
}
