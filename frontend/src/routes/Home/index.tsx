import { Page } from '../../components/Page';
import { Table, Column, Value } from '../../components/Table';
import { useContext } from 'react';
import { BucketInfo } from '../../models/bucket';
import { getHumanSize, parseReadWriteAccess } from '../../commons/utils';
import { BucketsListContext } from '../../services/BucketListContext';
import { useNavigate } from 'react-router-dom';
import './index.css';

export const Home = () => {
  const navigate = useNavigate();
  const bucketList = useContext(BucketsListContext);

  const columns: Column[] = [
    { name: "Bucket", columnType: "string" },
    { name: "Objects", columnType: "string" },
    { name: "Size", columnType: "string" },
    { name: "Access", columnType: "string" }
  ];

  const tableData = bucketList.map((bucket: BucketInfo) => {
    return [
      { columnName: "Bucket", value: bucket.name },
      { columnName: "Objects", value: bucket.objects },
      { columnName: "Size", value: getHumanSize(bucket.size) },
      { columnName: "Access", value: parseReadWriteAccess(bucket.rw_access) }
    ]
  });

  const onClick = (_: React.MouseEvent<HTMLTableRowElement>, index: number) => {
    const bucketName = bucketList[index].name;
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
