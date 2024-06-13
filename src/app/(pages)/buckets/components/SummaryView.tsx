import { dateToHuman, getHumanSize } from "@/commons/utils";
import { BucketConfiguration, BucketInfo } from "@/models/bucket";
import { ChartPieIcon, ClockIcon, CubeIcon } from "@heroicons/react/24/outline";
import DeleteBucketButton from "./DeleteBucketButton";
import EditBucketButton from "./EditBucketButton";
import { getBucketConfiguration } from "../actions";

interface SubviewProps {
  title: string;
  text: string;
  icon: JSX.Element;
}

const Subview = ({ title, text, icon }: SubviewProps) => {
  return (
    <div className="mt-2 flex content-center">
      <div className="my-auto mr-2 w-5">{icon}</div>
      <div className="my-auto mr-1 font-semibold">{title}</div>
      {text}
    </div>
  );
};

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

  return (
    <div className={className}>
      <div className="rounded border bg-secondary p-2 text-primary">
        <div className="grid grid-cols-1 sm:grid-cols-2">
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
          <div className="ml-auto mr-0 flex space-x-2 p-4 sm:flex-col sm:space-x-0 sm:space-y-4">
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
