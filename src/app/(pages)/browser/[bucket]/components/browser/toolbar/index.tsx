import HomeButton from "./home-button";
import UploadButton from "./upload-button";
import RefreshButton from "./refresh-button";
import NewPathButton from "./new-path-button";

export default function Toolbar(
  props: Readonly<{
    bucket: string;
    currentPath: string;
    objectsToDelete: string[];
    onPathChange?: (newPath: string) => void;
    onDeleted?: () => void;
  }>
) {
  const { bucket, currentPath, onPathChange } =
    props;
  return (
    <div className="mt-8 grid grid-cols-1 sm:grid-cols-2">
      <div className="flex space-x-2 py-1">
        <HomeButton />
        <UploadButton bucket={bucket} currentPath={currentPath} />
        <RefreshButton />
      </div>
      <div className="flex space-x-2 py-1 sm:mr-0 sm:ml-auto">
        <NewPathButton
          bucket={bucket}
          currentPath={currentPath}
          onPathChange={onPathChange}
        />
      </div>
    </div>
  );
}
