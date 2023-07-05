import { PlusIcon } from "@heroicons/react/24/outline";
import { Button } from "../../components/Button";

interface ToolbarParams {
  className?: string;
  onClickNewBucket?: () => void;
}

export const Toolbar = (params: ToolbarParams) => {
  const { className, onClickNewBucket } = params;
  return (
    <div id="toolbar" className={className}>
      <div className="flex justify-end">
        <Button title="Create Bucket" icon={<PlusIcon />} onClick={onClickNewBucket} />
      </div>
    </div>
  )
}
