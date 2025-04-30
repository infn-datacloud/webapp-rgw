import { makeS3Client } from "@/services/s3/actions";
import { ObjectTable } from "./table";

export type BucketBrowserProps = {
  path: [string];
  nextContinuationToken?: string;
  count?: number;
};

export async function Browser(props: Readonly<BucketBrowserProps>) {
  const { path, count, nextContinuationToken } = props;
  const bucket = path[0];
  const prefix = path.length > 1 ? path.splice(1).join("/") + "/" : "";

  if (!bucket) {
    return <p>Bucket not found</p>;
  }

  const currentPath = path.join("/");
  const pathname = `/browser/${currentPath}`;

  const s3 = await makeS3Client();
  const response = await s3.listObjects(
    bucket,
    count,
    prefix,
    nextContinuationToken
  );

  if (!response) {
    return <div>Error</div>;
  }

  return (
    <div>
      <ObjectTable listObjectsOutput={response} pathname={pathname} />
    </div>
  );
}
