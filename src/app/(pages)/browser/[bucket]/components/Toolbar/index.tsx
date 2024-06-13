import HomeButton from "./HomeButton";
import UploadButton from "./UploadButton";
import RefreshButton from "./RefreshButton";
import NewPathButton from "./NewPathButton";
import DeleteButton from "./DeleteButton";

export default function Toolbar(
  props: Readonly<{
    bucket: string;
    currentPath: string;
    objectsToDelete: string[];
    onPathChange?: (newPath: string) => void;
    onDeleted?: () => void;
  }>
) {
  const { bucket, currentPath, objectsToDelete, onPathChange, onDeleted } =
    props;
  return (
    <div className="mt-8 flex place-content-between">
      <div className="flex space-x-4">
        <HomeButton />
        <UploadButton bucket={bucket} currentPath={currentPath} />
        <RefreshButton />
      </div>
      <div className="flex space-x-4">
        <NewPathButton
          bucket={bucket}
          currentPath={currentPath}
          onPathChange={onPathChange}
        />
        <DeleteButton
          bucket={bucket}
          objectsToDelete={objectsToDelete}
          onDeleted={onDeleted}
        />
      </div>
    </div>
  );
}
