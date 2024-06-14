import { ChartPieIcon, ClockIcon, CubeIcon } from "@heroicons/react/24/outline";
import Subview from "./Subview";

function LoadingSkeleton() {
  return (
    <div className="my-auto h-3 w-1/5 animate-pulse-fast duration-100 rounded-full bg-gray-200" />
  );
}

export function SummaryLoading(props: Readonly<{ bucket?: string }>) {
  const { bucket } = props;
  return (
    <div className="mt-4 rounded border bg-secondary p-2 text-primary dark:bg-primary-dark dark:text-secondary">
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
