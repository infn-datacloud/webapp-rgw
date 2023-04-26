import { BucketObject } from "../models/bucket";
import { Button } from "./Button";
import { Inspector, InspectorProps } from "./Inspector";
import { ArrowDownCircleIcon } from "@heroicons/react/24/outline";
interface BucketInspectorProps extends InspectorProps {
  buckets: BucketObject[]
}

export const BucketInspector = (props: BucketInspectorProps) => {

  const { buckets } = props;
  const title = buckets.length === 1 ? buckets[0].Key : "Multiple objects";

  console.log(buckets[0]);

  return (
    <Inspector
      isOpen={props.isOpen}>
      {props.children}
      <div className="p-8 text-lg font-semibold">
        {title}
      </div>
      <Button className="w-full" title="Download" icon={<ArrowDownCircleIcon />} />

      <hr className="h-px w-full my-8 bg-gray-200 border-0 dark:bg-gray-700"></hr>
    </Inspector>
  )
}