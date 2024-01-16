import { PlusIcon, ServerIcon } from "@heroicons/react/24/outline";
import { Button } from "../../components/Button";

interface ToolbarParams {
  className?: string;
  onClickNewBucket?: () => void;
  onClickMountBucket?: () => void;
}

export const Toolbar = (params: ToolbarParams) => {
  const { className, onClickNewBucket, onClickMountBucket } = params;
  return (
    <div id="toolbar" className={className}>
      <div className="flex justify-between">
        <Button
          title="Create Bucket"
          icon={<PlusIcon />}
          onClick={onClickNewBucket}
        />
        <Button
          title="Mount Bucket"
          icon={<ServerIcon />}
          onClick={onClickMountBucket}
        />
      </div>
    </div>
  );
};
