import { dateToHuman } from "@/commons/utils";
import { Bucket } from "@aws-sdk/client-s3";
import Link from "next/link";

function BucketLink(props: Readonly<{ bucket: Bucket }>) {
  const { bucket } = props;
  const creationDate = bucket.CreationDate
    ? dateToHuman(bucket.CreationDate)
    : "N/A";
  return (
    <li className="text-primary dark:text-secondary border-b border-slate-200 bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700">
      <Link className="flex p-4" href={`/browser/${bucket.Name}`}>
        <span className="grow">{bucket.Name}</span>
        <span className="min-w-36">{creationDate}</span>
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
      <div className="flex px-4 pt-8 pb-2">
        <div className="grow font-bold">Bucket</div>
        <div className="min-w-80 font-bold">Creation Date</div>
      </div>
      <ul className="bg-secondary">
        {buckets.map(bucket => {
          return <BucketLink key={bucket.Name} bucket={bucket} />;
        })}
      </ul>
      <div className="h-12" />
    </div>
  );
}
