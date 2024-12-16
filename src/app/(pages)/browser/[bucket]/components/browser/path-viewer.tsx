import { NodePath } from "@/commons/utils";
import { SearchFiled } from "@/components/search-field";
import { _Object } from "@aws-sdk/client-s3";
import { ChevronUpIcon } from "@heroicons/react/24/solid";

interface PathViewerProps {
  bucket: string;
  path: NodePath<_Object>;
  onClickBackButton: () => void;
  onQuerySearchChanged?: (query: string) => void;
}

export default function PathViewer(props: Readonly<PathViewerProps>) {
  const { bucket, path, onClickBackButton, onQuerySearchChanged } = props;
  return (
    <div className="grid grid-cols-1 py-2 sm:grid-cols-2">
      <div className="flex space-x-2 text-primary dark:text-secondary">
        <PathBackButton onClick={onClickBackButton} isRoot={!!path.parent} />
        <div className="my-auto font-bold">Current path:</div>
        <div className="my-auto">{bucket + "/" + path.path}</div>
      </div>
      <SearchFiled
        className="sm:ml-auto sm:mr-0"
        onChange={onQuerySearchChanged}
      />
    </div>
  );
}

const PathBackButton = (props: { onClick: () => void; isRoot: boolean }) => {
  const { onClick, isRoot } = props;
  return (
    <button
      className={`my-auto h-8 w-8 rounded-full p-[5px] text-primary transition-transform hover:bg-neutral-200 dark:text-secondary dark:hover:bg-neutral-600 ${isRoot ? "rotate-0" : "-rotate-90"}`}
      onClick={onClick}
      type="button"
    >
      <ChevronUpIcon />
    </button>
  );
};
