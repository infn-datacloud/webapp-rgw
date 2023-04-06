import { useState } from 'react';
import { Page } from '../../components/Page';
import APIService from "../../services/APIService";
import { getHumanSize } from '../../commons/utils';
import { BucketInfo } from '../../models/bucket';

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
  const [isFirstRender, setIsFirstRender] = useState(true);
  const [buckestList, setBucketLists] = useState<BucketInfo[]>([]);

  if (isFirstRender) {
    setIsFirstRender(false);
    APIService.get("buckets")
      .then(data => {
        console.log(data);
        setBucketLists(data["buckets"]);
      });
  }

  return (
    <Page title='Buckets'>
      {buckestList ? buckestList.map(bucketInfo =>
        <BucketView
          key={bucketInfo.name + bucketInfo.creation_date}
          {...bucketInfo}
        />
      ) : null}
    </Page>
  )
}