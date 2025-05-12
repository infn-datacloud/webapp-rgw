import { Page } from "@/components/page";
import { makeS3Client } from "@/services/s3/actions";
import BucketsTable from "./components/buckets-table";

export default async function Browser() {
  const s3 = await makeS3Client();
  const { publics, privates } = await s3.fetchBucketList();
  const buckets = [...privates, ...publics];

  return (
    <Page title="Browser">
      <div className="flex place-content-center">
        <BucketsTable buckets={buckets} />
      </div>
    </Page>
  );
}
