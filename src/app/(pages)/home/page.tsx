import { Page } from "@/components/Page";
import { makeS3Client } from "@/services/s3/actions";
import { makeTableData } from "./utils";
import BucketsTable from "./buckets-table";
import { auth } from "@/auth";

export default async function Home() {
  const session = await auth();
  if (session) {
    console.log(session.expires);
  }

  const s3 = await makeS3Client();
  const bucketsInfos = await s3.getBucketsInfos();
  const tableData = makeTableData(bucketsInfos);

  return (
    <Page title="Home">
      <div className="flex place-content-center">
        <BucketsTable data={tableData} />
      </div>
    </Page>
  );
}
