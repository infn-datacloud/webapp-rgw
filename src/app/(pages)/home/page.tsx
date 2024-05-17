import { Page } from "@/components/Page";
import { BucketInfo } from "@/models/bucket";
import { auth } from "@/auth";
import { S3Service } from "@/services/s3";
import { s3ClientConfig } from "@/services/s3/actions";
import { makeTableData } from "./utils";
import BucketsTable from "./buckets-table";

export default async function Home() {
  const session = await auth();
  let bucketsInfos: BucketInfo[] = [];

  if (!session) {
    throw Error("Session is not available");
  }

  const { credentials } = session;
  if (credentials) {
    const s3Config = await s3ClientConfig(credentials);
    const s3 = new S3Service(s3Config);
    bucketsInfos = await s3.getBucketsInfos();
  } else {
    throw new Error("Cannot find credentials");
  }

  const tableData = makeTableData(bucketsInfos);

  return (
    <Page title="Home">
      <div className="flex place-content-center">
        <BucketsTable data={tableData} />
      </div>
    </Page>
  );
}
