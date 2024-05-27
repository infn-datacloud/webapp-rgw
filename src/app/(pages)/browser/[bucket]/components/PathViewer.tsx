import { NodePath } from "@/commons/utils";
import { _Object } from "@aws-sdk/client-s3";
import { ChevronUpIcon } from "@heroicons/react/24/solid";

interface PathViewerProps {
  bucket: string;
  path: NodePath<_Object>;
  onClickBackButton: () => void;
}

export default function PathViewer(props: PathViewerProps) {
  const { bucket, path, onClickBackButton } = props;
  return (
    <div className="py-4">
      <div className="flex space-x-2">
        <PathBackButton onClick={onClickBackButton} />
        <div className="font-bold my-auto">Current path:</div>
        <div className="my-auto">{bucket + "/" + path.path}</div>
      </div>
    </div>
  );
}

const PathBackButton = (props: { onClick: () => void }) => {
  const { onClick } = props;
  return (
    <button
      className="w-8 h-8 p-[5px] text-neutral-500 hover:bg-neutral-200 
      rounded-full my-auto"
      onClick={onClick}
      type="button"
    >
      <ChevronUpIcon />
    </button>
  );
};
