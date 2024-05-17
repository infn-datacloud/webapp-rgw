import HomeButton from "./HomeButton";
import UploadButton from "./UploadButton";
import RefreshButton from "./RefreshButton";
import NewPathButton from "./NewPathButton";
import DeleteButton from "./DeleteButton";
import { _Object } from "@aws-sdk/client-s3";

export default function Toolbar(props: {
  bucket: string;
  currentPath: string;
  selectedObjects: _Object[];
}) {
  const { bucket, currentPath, selectedObjects } = props;
  return (
    <div className="flex mt-8 place-content-between">
      <div className="flex space-x-4">
        <HomeButton />
        <UploadButton bucket={bucket} currentPath={currentPath} />
        <RefreshButton />
      </div>
      <div className="flex space-x-4">
        <NewPathButton />
        <DeleteButton bucket={bucket} selectedObjects={selectedObjects} />
      </div>
    </div>
  );
}
