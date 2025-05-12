import { Page } from "@/components/page";
import { makeS3Client } from "@/services/s3/actions";
import { Bucket } from "@aws-sdk/client-s3";
import { BucketInfo, Toolbar } from "./components";

function BucketsInfos(props: { buckets: Bucket[]; isPublic: boolean }) {
  const { buckets, isPublic } = props;
  return (
    <>
      {buckets.map(bucket => (
        <BucketInfo key={bucket.Name} bucket={bucket} isPublic={isPublic} />
      ))}
    </>
  );
}

export default async function Buckets() {
  const s3 = await makeS3Client();
  const buckets = await s3.fetchBucketList();

  return (
    <Page title="Buckets">
      <Toolbar />
      <ul className="flex flex-col gap-4 pt-4">
        <BucketsInfos buckets={buckets.privates} isPublic={false} />
        <BucketsInfos buckets={buckets.publics} isPublic={true} />
      </ul>
    </Page>
  );
}
