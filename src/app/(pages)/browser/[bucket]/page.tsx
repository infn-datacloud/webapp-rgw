import BucketBrowser from "./components/BucketBrowser";
import { makeS3Client } from "@/services/s3/actions";
import { Page } from "@/components/Page";
import { _Object } from "@aws-sdk/client-s3";
import { redirect } from "next/navigation";
import { Suspense } from "react";

function LoadingBar() {
  return (
    <div className="w-full">
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-primary/10">
        <div className="animate-progress h-full w-full origin-left rounded-full bg-primary" />
      </div>
    </div>
  );
}

async function AsyncBrowser(props: { bucket: string }) {
  const { bucket } = props;

  let objectList: _Object[] = [];

  try {
    const s3 = await makeS3Client();
    objectList = await s3.listObjects(bucket);
  } catch (err) {
    console.error(err);
    if (err instanceof Error && err.name === "AccessDenied") {
      redirect("/logout");
    } else {
      throw err;
    }
  }
  return <BucketBrowser bucket={bucket} bucketObjects={objectList} />;
}

export default function Browser(props: { params: { bucket: string } }) {
  const { bucket } = props.params;
  return (
    <Page title={bucket}>
      <Suspense fallback={<LoadingBar />}>
        <AsyncBrowser bucket={bucket} />
      </Suspense>
    </Page>
  );
}
