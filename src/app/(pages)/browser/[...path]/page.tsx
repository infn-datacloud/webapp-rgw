import { Page } from "@/components/page";
import { Browser } from "./components";
import { makeS3Client } from "@/services/s3/actions";
import { ListObjectsV2CommandOutput } from "@aws-sdk/client-s3";

type BrowserProps = {
  params: Promise<{ path: [string] }>;
  searchParams?: Promise<{
    current?: string;
    next?: string;
    count?: string;
    q?: string;
  }>;
};

export default async function BucketBrowser(props: Readonly<BrowserProps>) {
  const { path } = await props.params;
  const searchParams = await props.searchParams;
  const nextContinuationToken = searchParams?.next;
  const count = searchParams?.count ? parseInt(searchParams?.count) : undefined;

  const folder = path.splice(1).join("/");
  const bucket = path[0];
  let prefix = folder ? `${folder}/` : undefined;
  const filepath = `${bucket}/${folder}`;
  const delimiter = "/";

  if (!bucket) {
    return <p>Bucket not found</p>;
  }

  const s3 = await makeS3Client();

  let response: ListObjectsV2CommandOutput | undefined = undefined;
  if (searchParams?.q) {
    response = await s3.searchObjects(bucket, prefix, searchParams.q);
  } else {
    response = await s3.listObjects(
      bucket,
      count,
      prefix,
      delimiter,
      nextContinuationToken
    );
  }

  if (!response) {
    return <div>Error</div>;
  }

  // this is a trick to force a remount of the Browser component for each
  // request, thus invalidating its internal states and re-render it with the
  // changed data
  const key = response.$metadata.requestId;

  return (
    <Page title={bucket}>
      <Browser
        key={key}
        bucket={bucket}
        filepath={filepath}
        prefix={prefix}
        showFullKeys={searchParams?.q !== undefined}
        listObjectOutput={response}
      />
    </Page>
  );
}
