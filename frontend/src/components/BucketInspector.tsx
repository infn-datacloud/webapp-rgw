import { getHumanSize } from "../commons/utils";
import { BucketObject } from "../models/bucket";
import { Button } from "./Button";
import { Inspector, InspectorProps } from "./Inspector";
import {
  ArrowDownCircleIcon,
  InformationCircleIcon,
  TrashIcon,
  XMarkIcon
} from "@heroicons/react/24/outline";

interface TitleProps {
  className?: string;
  title?: string;
}

const Title = ({ className, title }: TitleProps) => {
  return (
    <div className={className}>
      <div className="text-lg font-semibold break-words">
        {title}
      </div>
    </div>
  )
}

interface BucketInspectorProps extends InspectorProps {
  objects: BucketObject[]
  onClose?: (_: React.MouseEvent<HTMLButtonElement>) => void;
  onDownload?: () => void;
  onDelete?: () => void;
}

interface DetailProps {
  title: string;
  value?: string;
}

const Detail = ({ title, value }: DetailProps) => {
  return (
    <div className="my-4">
      <div className="text-lg font-semibold">{title}</div>
      <div className="break-all">{value}</div>
    </div>
  )
}

const ObjectDetail = (object: BucketObject) => {
  return (
    <>
      <div className="flex items-center">
        <div className="text-lg font-semibold">Object Info</div>
        <div className="ml-4 w-5"><InformationCircleIcon /></div>
      </div>
      <Detail title={"Key"} value={object.Key} />
      <Detail title={"ETag"} value={object.ETag} />
      <Detail title={"Last Modified"} value={object.LastModified?.toString() ?? "N/A"} />
      <Detail title={"Size"} value={getHumanSize(object.Size ?? 0)} />
    </>
  )
}

export const BucketInspector = (props: BucketInspectorProps) => {
  const { objects, onClose, onDelete, onDownload } = props;

  let object: BucketObject;
  let title: string;

  switch (objects.length) {
    case 0:
      object = { Key: "N/A" };
      title = "N/A";
      break;
    case 1:
      object = objects[0];
      title = object.Key;
      break;
    default:
      object = {
        Key: "Multiple values",
        ETag: "Multiple values",
        Size: objects.reduce((acc: number, value: BucketObject) => {
          return acc += value.Size ?? 0;
        }, 0)
      }
      title = "Multiple values";
  }

  return (
    <Inspector
      isOpen={props.isOpen}>
      <div className="flex p-4 flex-row-reverse">
        <button onClick={onClose}>
          <div
            className="w-5 p-[5px] bg-neutral-300 text-neutral-500
             hover:bg-neutral-400 rounded-full">
            <XMarkIcon />
          </div>
        </button>
      </div>
      <div className="px-4">
        <Title className="w-5/6" title={title} />
        <hr className="mt-4 mb-8"></hr>
        <Button
          className="w-full"
          title="Download"
          icon={<ArrowDownCircleIcon />}
          onClick={onDownload}
        />
        <Button
          className="w-full mt-4"
          title="Delete"
          icon={<TrashIcon />}
          onClick={onDelete}
        />
        <hr className="h-px w-full my-8 bg-gray-200 border-0"></hr>
        <ObjectDetail {...object} />
      </div>
      {props.children}
    </Inspector>
  )
}
