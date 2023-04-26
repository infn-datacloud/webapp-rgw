import { BucketObject } from "../models/bucket";
import { Inspector, InspectorProps } from "./Inspector";

interface BucketInspectorProps extends InspectorProps {
  buckets: BucketObject[]
}

export const BucketInspector = (props: BucketInspectorProps) => {

  const { buckets } = props;
  const title = buckets.length === 1 ? buckets[0].Key : "Multiple objects";

  return (
    <Inspector
      isOpen={props.isOpen}>
      {props.children}
      <div className="p-8 text-lg font-semibold">
        {title}
      </div>
    </Inspector>
  )
}