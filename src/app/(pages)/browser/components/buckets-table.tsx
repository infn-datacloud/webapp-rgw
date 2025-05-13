import { dateToHuman } from "@/commons/utils";
import { Bucket } from "@aws-sdk/client-s3";
import { ClockIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

function BucketLink(props: Readonly<{ bucket: Bucket }>) {
  const { bucket } = props;
  const creationDate = bucket.CreationDate
    ? dateToHuman(bucket.CreationDate)
    : "N/A";
  return (
    <li className="text-primary dark:text-secondary gap-2 border-b border-slate-200 bg-white p-4 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700">
      <Link className="flex flex-col" href={`/browser/${bucket.Name}`}>
        <span className="grow text-base font-bold">{bucket.Name}</span>
        <span className="dark:text-secondary/60 flex min-w-36 items-center gap-1 text-sm text-gray-400">
          <ClockIcon className=" size-4 h-[1lh]" />
          <span>Created {creationDate}</span>
        </span>
      </Link>
    </li>
  );
}

type BucketsTableProps = {
  buckets: Bucket[];
};

export default function BucketsTable(props: Readonly<BucketsTableProps>) {
  const { buckets } = props;

  return (
    <div className="text-primary dark:text-secondary w-full rounded-xl bg-neutral-100 text-sm shadow-md dark:bg-slate-700">
      <span className="flex px-4 pt-8 pb-2 text-lg font-bold">Buckets</span>
      <ul className="bg-secondary">
        {buckets.map(bucket => {
          return <BucketLink key={bucket.Name} bucket={bucket} />;
        })}
      </ul>
      <div className="h-12" />
    </div>
  );
}
