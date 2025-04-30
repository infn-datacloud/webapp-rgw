import { ObjectTable } from "./table";
import PathViewer from "./path-viewer";
import Toolbar from "./toolbar";
import { ListObjectsV2CommandOutput } from "@aws-sdk/client-s3";

export type BucketBrowserProps = {
  bucket: string;
  filepath: string;
  listObjectOutput: ListObjectsV2CommandOutput;
};

export function Browser(props: Readonly<BucketBrowserProps>) {
  const { bucket, filepath, listObjectOutput } = props;
  return (
    <div>
      <Toolbar bucket={bucket} currentPath={filepath} objectsToDelete={[]} />
      <PathViewer currentPath={filepath} />
      <ObjectTable listObjectsOutput={listObjectOutput} bucket={bucket} />
    </div>
  );
}
