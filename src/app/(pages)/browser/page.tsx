import { Page } from "@/components/Page";
import { makeS3Client } from "@/services/s3/actions";
import { makeTableData } from "./utils";
import BucketsTable from "./components/buckets-table";

export default async function Browser() {
  const s3 = await makeS3Client();
  const buckets = await s3.fetchBucketList();
  const tableData = makeTableData(buckets);

  return (
    <Page title="Browser">
      <div className="flex place-content-center">
        <BucketsTable data={tableData} />
      </div>
    </Page>
  );
}
