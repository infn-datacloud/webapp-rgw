import { ChartPieIcon, ClockIcon, CubeIcon } from "@heroicons/react/24/outline";
import { getHumanSize } from "../../commons/utils";
import { BucketInfo } from "../../models/bucket";

export const BucketSummaryView = ({ name, creation_date, rw_access, size, objects }: BucketInfo) => {
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
      <div className="text-xl font-semibold">{name}</div>
      <Subview title="Created at:" text={creation_date} icon={<ClockIcon />} />
      <Subview title="Usage:" text={getHumanSize(size) ?? "N/A"} icon={<ChartPieIcon />} />
      <Subview title="Objects:" text={`${objects}`} icon={<CubeIcon />} />
    </div>
  )
};
