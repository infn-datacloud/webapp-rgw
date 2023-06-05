import { Page } from "../../components/Page";
import { useS3Service } from "../../services/S3Service";
import { useContext } from "react";
import { BucketInfo } from "../../models/bucket";
import { BucketListContext } from "../../services/BucketListContext";

const BucketSummaryView = (bucketInfo: BucketInfo) => {
  return (
    <>
      <div className="text-lg">{bucketInfo.name}</div>
      Created at: {bucketInfo.creation_date}
      Access: {bucketInfo.rw_access}
      Usage {bucketInfo.size}
      Objects: {bucketInfo.objects}
    </>
  )
}


export const BucketAdministration = () => {
  const { bucketList } = useContext(BucketListContext);
  
  const summary = bucketList.map(bucket => {
    const bucketInfo: BucketInfo = {
      name: bucket.Name ?? "N/A",
      creation_date: bucket.CreationDate?.toString() ?? "N/A",
      rw_access: { read: true, write: true },
      objects = 
    }
    return <BucketSummaryView bucketInfo={} />
  });

  return (
    <Page title="Buckets">

    </Page>
  )
}