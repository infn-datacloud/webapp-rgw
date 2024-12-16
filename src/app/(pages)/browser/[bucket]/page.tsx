import BucketBrowser from "./components/BucketBrowser";
import { makeS3Client } from "@/services/s3/actions";
import { Page } from "@/components/Page";
import { _Object } from "@aws-sdk/client-s3";
import { redirect } from "next/navigation";
import { Suspense } from "react";

function LoadingBar() {
  return (
    <div className="w-full">
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-primary/10 dark:bg-secondary/10">
        <div className="h-full w-full origin-left animate-progress rounded-full bg-primary dark:bg-primary-200" />
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

type BrowserProps = {
  params: Promise<{ bucket: string }>;
};

export default async function Browser(props: Readonly<BrowserProps>) {
  const { bucket } = await props.params;
  return (
    <Page title={bucket}>
      <Suspense fallback={<LoadingBar />}>
        <AsyncBrowser bucket={bucket} />
      </Suspense>
    </Page>
  );
}
