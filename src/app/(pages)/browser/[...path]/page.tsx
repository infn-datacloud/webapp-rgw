import { Page } from "@/components/page";
import { _Object } from "@aws-sdk/client-s3";
import { Browser } from "./components";
import { makeS3Client } from "@/services/s3/actions";

type BrowserProps = {
  params: Promise<{ path: [string] }>;
  searchParams?: Promise<{
    current?: string;
    next?: string;
    count?: string;
  }>;
};

export default async function BucketBrowser(props: Readonly<BrowserProps>) {
  const { path } = await props.params;
  const searchParams = await props.searchParams;
  const nextContinuationToken = searchParams?.next;
  const count = searchParams?.count ? parseInt(searchParams?.count) : undefined;

  const folder = path.splice(1).join("/");
  const bucket = path[0];
  const prefix = folder ? `${folder}/` : undefined;
  const filepath = `${bucket}/${folder}`;

  if (!bucket) {
    return <p>Bucket not found</p>;
  }

  const s3 = await makeS3Client();
  const response = await s3.listObjects(
    bucket,
    count,
    prefix,
    nextContinuationToken
  );

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
        listObjectOutput={response}
      />
    </Page>
  );
}
