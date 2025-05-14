// SPDX-FileCopyrightText: 2025 Istituto Nazionale di Fisica Nucleare
//
// SPDX-License-Identifier: EUPL-1.2

import { Bucket } from "@aws-sdk/client-s3";
import { dateToHuman } from "@/commons/utils";
import { BucketConfiguration } from "@/models/bucket";
import { ClockIcon } from "@heroicons/react/24/outline";
import { getBucketConfiguration } from "./actions";
import { BucketOptions } from "./options";

type BucketSummaryViewProps = {
  bucket: Bucket;
  isPublic?: boolean;
};

export async function BucketSummaryView(
  props: Readonly<BucketSummaryViewProps>
) {
  const { bucket, isPublic } = props;
  const { Name, CreationDate } = bucket;
  const creationDate = CreationDate ? dateToHuman(CreationDate) : "N/A";

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
    <div className="bg-secondary text-primary dark:text-secondary dark:border-secondary/30 flex rounded-xl border border-gray-200 p-4 dark:bg-transparent">
      <div className="flex grow flex-col gap-1">
        <span className="text-xl font-bold">{Name}</span>
        <div className="dark:text-secondary/50 my-auto flex items-center gap-1 text-sm">
          <ClockIcon className="size-4" />
          <span>Created {creationDate}</span>
        </div>
      </div>
      <div className="my-auto flex-col" hidden={isPublic}>
        <BucketOptions bucket={bucket} configuration={bucketConfiguration} />
      </div>
    </div>
  );
}
