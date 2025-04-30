import { makeS3Client } from "@/services/s3/actions";
import { ObjectTable } from "./table";
import PathViewer from "./path-viewer";

export type BucketBrowserProps = {
  path: [string];
  nextContinuationToken?: string;
  count?: number;
};

export async function Browser(props: Readonly<BucketBrowserProps>) {
  const { path, count, nextContinuationToken } = props;

  const folder = path.splice(1).join("/");
  const bucket = path[0];
  const prefix = folder ? `${folder}/` : undefined;
  const filepath = `${bucket}/${folder}`;

  if (!bucket) {
    return <p>Bucket not found</p>;
  }

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
      <PathViewer currentPath={filepath} />
      <ObjectTable listObjectsOutput={response} bucket={bucket} />
    </div>
  );
}
