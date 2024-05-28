import { auth } from "@/auth";
import { Page } from "@/components/Page";
import { BucketInfo } from "@/models/bucket";
import { S3Service } from "@/services/s3";
import { s3ClientConfig } from "@/services/s3/actions";
import { BucketSummaryView } from "./components/SummaryView";
import EditBucketModal from "./components/EditBucketModal";

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

  return (
    <Page title="Buckets">
      <EditBucketModal />
      <BucketsInfos bucketsInfos={bucketsInfos} />
    </Page>
  );
}
