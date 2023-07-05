import { ChartPieIcon, ClockIcon, CubeIcon } from "@heroicons/react/24/outline";
import { getHumanSize } from "../../commons/utils";
import { BucketInfo } from "../../models/bucket";
import { Button } from "../../components/Button";

export interface BucketSummaryViewProps extends BucketInfo {
  onDeleteBucket: (bucket: string) => void;
}

export const BucketSummaryView = (props: BucketSummaryViewProps) => {
  const { name, creation_date, size, objects, onDeleteBucket } = props;
  interface SubviewProps {
    title: string,
    text: string,
    icon: JSX.Element
  }

  const Subview = ({ title, text, icon }: SubviewProps) => {
    return (
      <div className="flex mt-2 content-center">
        <div className="w-5 my-auto mr-2">{icon}</div>
        <div className="font-semibold mr-1 my-auto">{title}</div>
        {text}
      </div>
    )
  }

  return (
    <div className="bg-neutral-100 border p-2">
      <div className="flex justify-between">
        <div>
          <div className="text-xl font-semibold">{name}</div>
          <Subview title="Created at:" text={creation_date} icon={<ClockIcon />} />
          <Subview title="Usage:" text={getHumanSize(size) ?? "N/A"} icon={<ChartPieIcon />} />
          <Subview title="Objects:" text={`${objects}`} icon={<CubeIcon />} />
        </div>
        <Button className="my-auto p-4" title="Delete Bucket" onClick={() => onDeleteBucket(name)} />
      </div>
    </div>
  )
};
