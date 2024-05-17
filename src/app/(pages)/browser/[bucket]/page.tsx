import { auth } from "@/auth";
import { Page } from "@/components/Page";
import { S3Service } from "@/services/s3";
import { _Object } from "@aws-sdk/client-s3";
import BucketBrowser from "./BucketBrowser";
import { s3ClientConfig } from "@/services/s3/actions";

export default async function Browser(props: { params: { bucket: string } }) {
  const { params } = props;
  const { bucket } = params;

  const session = await auth();
  let objectList: _Object[] = [];

  if (!session) {
    throw Error("Session is not available");
  }

  const { credentials } = session;
  if (credentials) {
    const s3Config = await s3ClientConfig(credentials);
    const s3 = new S3Service(s3Config);
    objectList = await s3.listObjects(bucket);
  } else {
    throw new Error("Cannot find credentials");
  }

  return (
    <Page title={bucket}>
      <BucketBrowser bucket={bucket} bucketObjects={objectList} />
    </Page>
  );
}
