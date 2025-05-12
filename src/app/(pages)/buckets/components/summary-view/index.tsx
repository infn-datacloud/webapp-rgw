import { Bucket } from "@aws-sdk/client-s3";
import { Suspense } from "react";
import { BucketSummaryView } from "./bucket-summary";
import { SummaryLoading } from "./loading";

type BucketInfoProps = {
  bucket: Bucket;
  isPublic?: boolean;
};

export default function BucketInfo(props: Readonly<BucketInfoProps>) {
  const { bucket, isPublic } = props;
  return (
    <li>
      <Suspense
        fallback={<SummaryLoading bucket={bucket.Name} />}
        key={bucket.Name}
      >
        <BucketSummaryView bucket={bucket} isPublic={isPublic} />
        {/* <SummaryLoading bucket={bucket.Name} /> */}
      </Suspense>
    </li>
  );
}
