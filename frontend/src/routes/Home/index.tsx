import { Page } from '../../components/Page';
import { Table } from '../../components/Table';
import './index.css';
import { useState } from 'react';
import { BucketInfo } from '../../models/bucket';
import APIService from '../../services/APIService';
import { getHumanSize, parseReadWriteAccess } from '../../commons/utils';


export const Home = () => {

  const [isFirstRender, setIsFirstRender] = useState(true);
  const [bucketList, setBucketLists] = useState<BucketInfo[][]>([]);

  const columns = ["Bucket", "Objects", "Size", "Access"];

  if (isFirstRender) {
    setIsFirstRender(false);
    APIService.get("buckets")
      .then(data => {
        setBucketLists(data["buckets"].map((bucket: BucketInfo) => {
          return [
            bucket.name,
            bucket.objects,
            getHumanSize(bucket.size),
            parseReadWriteAccess(bucket.rw_access)
          ]
        }));
      });
  }

  return (
    <Page title="Home">
      <div className="Home">
        <div className="flex place-content-center">
        <Table className="table-auto w-2/3" columns={columns} data={bucketList} />
        </div>
      </div>
    </Page>
  );
}
