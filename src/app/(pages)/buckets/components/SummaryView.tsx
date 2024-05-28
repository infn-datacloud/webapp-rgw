import { getHumanSize } from "@/commons/utils";
import { Button } from "@/components/Button";
import { BucketInfo } from "@/models/bucket";
import {
  ChartPieIcon,
  ClockIcon,
  CubeIcon,
  PencilSquareIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";

export interface BucketSummaryViewProps extends BucketInfo {
  className?: string;
}

export const BucketSummaryView = (props: BucketSummaryViewProps) => {
  const { name, creation_date, size, objects, className } = props;
  interface SubviewProps {
    title: string;
    text: string;
    icon: JSX.Element;
  }

  const Subview = ({ title, text, icon }: SubviewProps) => {
    return (
      <div className="flex mt-2 content-center">
        <div className="w-5 my-auto mr-2">{icon}</div>
        <div className="font-semibold mr-1 my-auto">{title}</div>
        {text}
      </div>
    );
  };

  return (
    <div className={className}>
      <div className="bg-neutral-100 border p-2">
        <div className="flex justify-between">
          <div>
            <div className="text-xl font-semibold">{name}</div>
            <Subview
              title="Created at:"
              text={creation_date}
              icon={<ClockIcon />}
            />
            <Subview
              title="Usage:"
              text={getHumanSize(size) ?? "N/A"}
              icon={<ChartPieIcon />}
            />
            <Subview title="Objects:" text={`${objects}`} icon={<CubeIcon />} />
          </div>
          <div className="flex flex-col space-y-2">
            <Link href={`/buckets?bucket=${name}&modal=true`}>
              <Button
                className="my-auto pr-4"
                icon={<PencilSquareIcon />}
                title="Edit"
              />
            </Link>
            <Button
              className="my-auto pr-4"
              icon={<TrashIcon />}
              title="Delete"
              // onClick={() => onDelete(name)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
