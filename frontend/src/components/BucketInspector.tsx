import { getHumanSize } from "../commons/utils";
import { BucketObject } from "../models/bucket";
import { Button } from "./Button";
import { Inspector, InspectorProps } from "./Inspector";
import { ArrowDownCircleIcon, TrashIcon } from "@heroicons/react/24/outline";
interface BucketInspectorProps extends InspectorProps {
  buckets: BucketObject[]
}


interface DetailProps {
  title: string;
  value?: string;
}

const Detail = ({ title, value }: DetailProps) => {
  return (
    <div className="my-4">
      <div className="font-semibold">{title}</div>
      <div className="break-all">{value}</div>
    </div>
  )
}

const ObjectDetail = (object: BucketObject) => {
  return (
    <>
      <Detail title={"Key"} value={object.Key} />
      <Detail title={"ETag"} value={object.ETag} />
      <Detail title={"Last Modified"} value={object.LastModified?.toString()} />
      <Detail title={"Owner"} value={object.Owner?.ID} />
      <Detail title={"Size"} value={getHumanSize(object.Size ?? 0)} />
    </>
  )
}

export const BucketInspector = (props: BucketInspectorProps) => {

  const { buckets } = props;
  const title = buckets.length === 1 ? buckets[0].Key : "Multiple objects";
  const bucket = buckets[0];

  return (
    <Inspector
      isOpen={props.isOpen}>
      {props.children}
      <div className="p-8 text-lg font-semibold">
        {title}
      </div>
      <div className="p-4">
        <Button className="w-full" title="Download" icon={<ArrowDownCircleIcon />} />
        <Button className="w-full mt-4" title="Delete" icon={<TrashIcon />} />
        <hr className="h-px w-full my-8 bg-gray-200 border-0 dark:bg-gray-700"></hr>
        <div className="text-lg font-semibold">Object Info</div>
        <ObjectDetail {...bucket} />
      </div>
    </Inspector>
  )
}
