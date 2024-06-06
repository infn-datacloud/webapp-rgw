import { dateToHuman, getHumanSize } from "@/commons/utils";
import { BucketConfiguration, BucketInfo } from "@/models/bucket";
import { ChartPieIcon, ClockIcon, CubeIcon } from "@heroicons/react/24/outline";
import DeleteBucketButton from "./DeleteBucketButton";
import EditBucketButton from "./EditBucketButton";
import { getBucketConfiguration } from "../actions";

export interface BucketSummaryViewProps extends BucketInfo {
  className?: string;
}

export const BucketSummaryView = async (props: BucketSummaryViewProps) => {
  const { name, creation_date, size, objects, className } = props;
  let bucketConfiguration: BucketConfiguration | undefined = undefined;
  try {
    bucketConfiguration = await getBucketConfiguration(name);
  } catch (err) {
    if (err instanceof Error) {
      console.error(
        `cannot fetch bucket configuration for bucket '${name}': error ${err.name}`
      );
    } else {
      console.error(err);
    }
  }

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
      <div className="text-primary bg-secondary border rounded p-2">
        <div className="flex justify-between">
          <div>
            <div className="text-xl font-bold">{name}</div>
            <Subview
              title="Created at:"
              text={
                creation_date ? dateToHuman(new Date(creation_date)) : "N/A"
              }
              icon={<ClockIcon />}
            />
            <Subview
              title="Usage:"
              text={getHumanSize(size) ?? "N/A"}
              icon={<ChartPieIcon />}
            />
            <Subview title="Objects:" text={`${objects}`} icon={<CubeIcon />} />
          </div>
          <div className="flex flex-col justify-between p-4">
            <EditBucketButton
              bucket={name}
              configuration={bucketConfiguration}
            />
            <DeleteBucketButton bucket={name} />
          </div>
        </div>
      </div>
    </div>
  );
};
