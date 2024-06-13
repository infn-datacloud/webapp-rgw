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
    <div className="mt-8 grid grid-cols-1 sm:grid-cols-2">
      <div className="flex space-x-2 py-1">
        <HomeButton />
        <UploadButton bucket={bucket} currentPath={currentPath} />
        <RefreshButton />
      </div>
      <div className="flex space-x-2 py-1 sm:ml-auto sm:mr-0">
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
