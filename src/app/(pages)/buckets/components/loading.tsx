import { ChartPieIcon, ClockIcon, CubeIcon } from "@heroicons/react/24/outline";
import Subview from "./Subview";

export function SummaryLoading(props: { bucket?: string }) {
  const { bucket } = props;
  return (
    <div className="dark:bg-primary-dark mt-4 rounded border bg-secondary p-2 text-primary dark:text-secondary">
      <div className="flex flex-col">
        <div className="text-xl font-bold">{bucket}</div>
        <Subview title="Created at:" text="loading..." icon={<ClockIcon />} />
        <Subview title="Usage:" text={"loading..."} icon={<ChartPieIcon />} />
        <Subview title="Objects:" text={"loading..."} icon={<CubeIcon />} />
      </div>
    </div>
  );
}
