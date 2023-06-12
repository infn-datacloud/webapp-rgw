import { PlusIcon } from "@heroicons/react/24/outline";
import { Button } from "../../components/Button";

interface ToolbarParams {
  className?: string;
}

export const Toolbar = (params: ToolbarParams) => {
  const { className } = params;
  return (
    <div className={className}>
      <div className="flex justify-end">
        <Button title="Create Bucket" icon={<PlusIcon />} />
      </div>
    </div>
  )
}
