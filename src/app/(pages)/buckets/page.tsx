import { Page } from "@/components/Page";
import { BucketInfo } from "@/models/bucket";
import { makeS3Client } from "@/services/s3/actions";
import { BucketSummaryView } from "./components/SummaryView";
import EditBucketModal from "./components/EditBucketModal";
import CreateBucketModal from "./components/CreateBucketModal";
import Toolbar from "./components/Toolbar";

function BucketsInfos(props: { bucketsInfos: BucketInfo[] }) {
  const { bucketsInfos } = props;
  return (
    <>
      {bucketsInfos.map(el => {
        return <BucketSummaryView className={"mb-4"} key={el.name} {...el} />;
      })}
    </>
  );
}

export default async function Buckets() {
  const s3 = await makeS3Client();
  const bucketsInfos = await s3.getBucketsInfos();

  return (
    <Page title="Buckets">
      {/* <CreateBucketModal /> */}
      {/* <EditBucketModal /> */}
      <Toolbar />
      <BucketsInfos bucketsInfos={bucketsInfos} />
    </Page>
  );
}
