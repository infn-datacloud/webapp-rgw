import BucketBrowser from "./components/BucketBrowser";
import { makeS3Client } from "@/services/s3/actions";
import { Page } from "@/components/Page";
import { _Object } from "@aws-sdk/client-s3";
import { redirect } from "next/navigation";

export default async function Browser(props: { params: { bucket: string } }) {
  const { params } = props;
  const { bucket } = params;

  let objectList: _Object[] = [];

  try {
    const s3 = await makeS3Client();
    objectList = await s3.listObjects(bucket);
  } catch (err) {
    if (err instanceof Error && err.name === "AccessDenied") {
      redirect("/logout");
    } else {
      throw err;
    }
  }

  return (
    <Page title={bucket}>
      <BucketBrowser bucket={bucket} bucketObjects={objectList} />
    </Page>
  );
}
