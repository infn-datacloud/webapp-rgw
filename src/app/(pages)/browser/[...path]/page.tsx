import { Page } from "@/components/page";
import { _Object } from "@aws-sdk/client-s3";
import { Suspense } from "react";
import { Browser } from "./components";

function LoadingBar() {
  return (
    <div className="w-full">
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-primary/10 dark:bg-secondary/10">
        <div className="h-full w-full origin-left animate-progress rounded-full bg-primary dark:bg-primary-200" />
      </div>
    </div>
  );
}

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
  const next = searchParams?.next;
  const count = searchParams?.count ? parseInt(searchParams?.count) : undefined;

  return (
    <Page title={path[0]}>
      <Suspense fallback={<LoadingBar />}>
        <Browser path={path} count={count} nextContinuationToken={next} />
      </Suspense>
    </Page>
  );
}
