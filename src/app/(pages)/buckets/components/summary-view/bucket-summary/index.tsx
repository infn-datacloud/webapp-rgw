import { dateToHuman, getHumanSize } from "@/commons/utils";
import { BucketConfiguration } from "@/models/bucket";
import { ChartPieIcon, ClockIcon, CubeIcon } from "@heroicons/react/24/outline";
import DeleteBucketButton from "./delete-button";
import EditBucketButton from "./edit-button";
import { getBucketConfiguration } from "./actions";
import { Bucket } from "@aws-sdk/client-s3";
import { makeS3Client } from "@/services/s3/actions";
import Subview from "./subview";

export interface BucketSummaryViewProps {
  bucket: Bucket;
  isPublic?: boolean;
}

export const BucketSummaryView = async (props: BucketSummaryViewProps) => {
  const { bucket, isPublic } = props;
  const s3 = await makeS3Client();
  const { name, creation_date, size, objects } = await s3.getBucketInfos(
    bucket.Name!
  );

  let bucketConfiguration: BucketConfiguration | undefined = undefined;
  try {
    bucketConfiguration = await getBucketConfiguration(name);
  } catch (err) {
    if (err instanceof Error) {
      console.warn(
        `cannot fetch bucket configuration for bucket '${name}': error '${err}'`
      );
    } else {
      console.error(err);
    }
  }

  return (
    <div className="bg-secondary text-primary dark:bg-transparent dark:text-secondary mt-4 rounded-xl border border-gray-200 p-2">
      <div className="grid grid-cols-1 sm:grid-cols-2">
        <div>
          <div className="text-xl font-bold">{name}</div>
          <Subview
            title="Created at:"
            item={creation_date ? dateToHuman(new Date(creation_date)) : "N/A"}
            icon={<ClockIcon />}
          />
          <Subview
            title="Usage:"
            item={getHumanSize(size) ?? "N/A"}
            icon={<ChartPieIcon />}
          />
          <Subview title="Objects:" item={`${objects}`} icon={<CubeIcon />} />
        </div>
        {!isPublic ? (
          <div className="mr-0 ml-auto flex space-x-2 p-4 sm:flex-col sm:space-y-4 sm:space-x-0">
            <EditBucketButton
              bucket={name}
              configuration={bucketConfiguration}
            />
            <DeleteBucketButton bucket={name} />
          </div>
        ) : null}
      </div>
    </div>
  );
};
