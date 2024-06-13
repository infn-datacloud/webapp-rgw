import { NodePath } from "@/commons/utils";
import { SearchFiled } from "@/components/SearchField";
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
    <div className="flex w-full justify-between py-4">
      <div className="flex space-x-2">
        <PathBackButton onClick={onClickBackButton} />
        <div className="my-auto font-bold">Current path:</div>
        <div className="my-auto">{bucket + "/" + path.path}</div>
      </div>
      <SearchFiled onChange={onQuerySearchChanged} />
    </div>
  );
}

const PathBackButton = (props: { onClick: () => void }) => {
  const { onClick } = props;
  return (
    <button
      className="my-auto h-8 w-8 rounded-full p-[5px] text-neutral-500 hover:bg-neutral-200"
      onClick={onClick}
      type="button"
    >
      <ChevronUpIcon />
    </button>
  );
};
