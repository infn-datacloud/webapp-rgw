import BucketBrowser from "./components/BucketBrowser";
import { makeS3Client } from "@/services/s3/actions";
import { Page } from "@/components/Page";

export default async function Browser(props: { params: { bucket: string } }) {
  const { params } = props;
  const { bucket } = params;

  const s3 = await makeS3Client();
  const objectList = await s3.listObjects(bucket);

  return (
    <Page title={bucket}>
      <BucketBrowser bucket={bucket} bucketObjects={objectList} />
    </Page>
  );
}
