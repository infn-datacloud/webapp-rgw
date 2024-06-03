import { Page } from "@/components/Page";
import { BucketInfo } from "@/models/bucket";
import { makeS3Client } from "@/services/s3/actions";
import { BucketSummaryView } from "./components/SummaryView";
import EditBucketModal from "./components/EditBucketModal";
import CreateBucketModal from "./components/CreateBucketModal";
import Toolbar from "./components/Toolbar";
import { redirect } from "next/navigation";

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
  let bucketsInfos: BucketInfo[] = [];

  try {
    const s3 = await makeS3Client();
    bucketsInfos = await s3.getBucketsInfos();
  } catch (err) {
    if (err instanceof Error && err.name === "AccessDenied") {
      redirect("/logout");
    } else {
      throw err;
    }
  }

  return (
    <Page title="Buckets">
      <CreateBucketModal />
      <EditBucketModal />
      <Toolbar />
      <BucketsInfos bucketsInfos={bucketsInfos} />
    </Page>
  );
}
