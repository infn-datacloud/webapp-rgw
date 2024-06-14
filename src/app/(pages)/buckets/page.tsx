import { Page } from "@/components/Page";
import { makeS3Client } from "@/services/s3/actions";
import { BucketSummaryView } from "./components/SummaryView";
import { SummaryLoading } from "./components/loading";
import Toolbar from "./components/Toolbar";
import { Bucket } from "@aws-sdk/client-s3";
import { Suspense } from "react";

function BucketsInfos(props: { buckets: Bucket[] }) {
  const { buckets } = props;
  return (
    <>
      {buckets.map(bucket => {
        return (
          <Suspense
            fallback={<SummaryLoading bucket={bucket.Name} />}
            key={bucket.Name}
          >
            <BucketSummaryView bucket={bucket} />
          </Suspense>
        );
      })}
    </>
  );
}

export default async function Buckets() {
  const s3 = await makeS3Client();
  const buckets = await s3.fetchBucketList();

  return (
    <Page title="Buckets">
      <Toolbar />
      <BucketsInfos buckets={buckets} />
    </Page>
  );
}
