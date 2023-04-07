import { useContext } from 'react';
import { Page } from '../../components/Page';
import { getHumanSize } from '../../commons/utils';
import { BucketInfo } from '../../models/bucket';
import { BucketsListContext } from '../../services/BucketListContext';

const BucketView = (bucketInfo: BucketInfo) => {
  const creationDate = new Date(bucketInfo.creation_date);
  return (
    <div className="bg-slate-100 w-2/3 mb-4 p-4 rounded-lg">
      <h1 className="text-2xl font-bold mb-2">{bucketInfo.name}</h1>
      <hr className="mb-2"></hr>
      <p>Created: {creationDate.toString()}</p>
      <p><b>Usage</b>: {getHumanSize(bucketInfo.size)}</p>
      <p><b>Object</b>: {bucketInfo.objects}</p>
    </div>
  )
}

export const Buckets = () => {
  const bucketList = useContext(BucketsListContext);

  return (
    <Page title='Buckets'>
      {bucketList.map(bucketInfo =>
        <BucketView
          key={bucketInfo.name + bucketInfo.creation_date}
          {...bucketInfo}
        />
      )}
    </Page>
  )
}