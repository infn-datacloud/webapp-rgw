import { dateToHuman } from "@/commons/utils";
import { BucketConfiguration } from "@/models/bucket";
import { ClockIcon } from "@heroicons/react/24/outline";
import DeleteBucketButton from "./delete-button";
import EditBucketButton from "./edit-button";
import { getBucketConfiguration } from "./actions";
import { Bucket } from "@aws-sdk/client-s3";
import Subview from "./subview";

export interface BucketSummaryViewProps {
  bucket: Bucket;
  isPublic?: boolean;
}

export const BucketSummaryView = async (props: BucketSummaryViewProps) => {
  const { bucket, isPublic } = props;
  const { Name, CreationDate } = bucket;
  const creation_date = CreationDate ? dateToHuman(CreationDate) : "N/A";

  if (!Name) {
    throw new Error("Bucket has no name");
  }

  let bucketConfiguration: BucketConfiguration | undefined = undefined;
  try {
    bucketConfiguration = await getBucketConfiguration(Name);
  } catch (err) {
    if (err instanceof Error) {
      console.warn(
        `cannot fetch bucket configuration for bucket '${Name}': error '${err}'`
      );
    } else {
      console.error(err);
    }
  }

  return (
    <div className="bg-secondary text-primary dark:bg-transparent dark:text-secondary mt-4 rounded-xl border border-gray-200 p-2">
      <div className="grid grid-cols-1 sm:grid-cols-2">
        <div>
          <div className="text-xl font-bold">{Name}</div>
          <Subview
            title="Created at:"
            item={creation_date}
            icon={<ClockIcon />}
          />
        </div>
        {!isPublic ? (
          <div className="mr-0 ml-auto flex space-x-2 p-4 sm:flex-col sm:space-y-4 sm:space-x-0">
            <EditBucketButton
              bucket={Name}
              configuration={bucketConfiguration}
            />
            <DeleteBucketButton bucket={Name} />
          </div>
        ) : null}
      </div>
    </div>
  );
};
