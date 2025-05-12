import { ChartPieIcon, ClockIcon, CubeIcon } from "@heroicons/react/24/outline";
import Subview from "../bucket-summary/subview";

function LoadingSkeleton() {
  return (
    <div className="my-auto h-3 w-1/5 animate-pulse rounded-full bg-gray-200" />
  );
}

export function SummaryLoading(props: Readonly<{ bucket?: string }>) {
  const { bucket } = props;
  return (
    <div className="bg-secondary text-primary dark:bg-primary-dark dark:text-secondary mt-4 rounded-xl border border-gray-200 p-2">
      <div className="flex flex-col">
        <div className="text-xl font-bold">{bucket}</div>
        <Subview
          title="Created at:"
          item={<LoadingSkeleton />}
          icon={<ClockIcon />}
        />
        <Subview
          title="Usage:"
          item={<LoadingSkeleton />}
          icon={<ChartPieIcon />}
        />
        <Subview
          title="Objects:"
          item={<LoadingSkeleton />}
          icon={<CubeIcon />}
        />
      </div>
    </div>
  );
}
