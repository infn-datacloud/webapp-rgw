import { useState } from 'react';
import { Page } from '../../components/Page';
import APIService from "../../services/APIService";

type BucketInfo = {
  Name: string,
  CreationDate: string;
}

const BucketView = (bucketInfo: BucketInfo) => {
  const creationDate = new Date(bucketInfo.CreationDate);
  return (
    <div className="bg-slate-100 w-2/3 mb-4 p-4 rounded-lg">
      <h1 className="text-2xl font-bold mb-2">{bucketInfo.Name}</h1>
      <p>Created: {creationDate.toString()}</p>
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
        setBucketLists(data["Buckets"]);
      });
  }

  return (
    <Page title='Buckets'>
      {buckestList.map(bucketInfo =>
        <BucketView
          key={bucketInfo.Name + bucketInfo.CreationDate}
          Name={bucketInfo.Name}
          CreationDate={bucketInfo.CreationDate} />
      )}
    </Page>
  )
}