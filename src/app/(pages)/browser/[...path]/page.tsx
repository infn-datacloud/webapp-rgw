import { Page } from "@/components/page";
import { _Object } from "@aws-sdk/client-s3";
import { Browser } from "./components";

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
      <Browser path={path} count={count} nextContinuationToken={next} />
    </Page>
  );
}
