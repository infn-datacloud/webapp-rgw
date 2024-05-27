import { getHumanSize } from "@/commons/utils";
import { Button } from "@/components/Button";
import { Inspector, InspectorProps } from "@/components/Inspector";
import IsomorphicDate from "@/components/IsomorphicDate";
import { _Object } from "@aws-sdk/client-s3";
import {
  ArrowDownCircleIcon,
  InformationCircleIcon,
  TrashIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

type TitleProps = {
  className?: string;
  title?: string;
};

const Title = ({ className, title }: TitleProps) => {
  return (
    <div className={className}>
      <div className="text-lg font-semibold break-words">{title}</div>
    </div>
  );
};

type DetailProps = {
  title: string;
  children?: React.ReactElement | string;
};

const Detail = ({ title, children }: DetailProps) => {
  return (
    <div className="my-4">
      <div className="text-lg font-semibold">{title}</div>
      <div className="break-all">{children}</div>
    </div>
  );
};

const ObjectDetail = (object: _Object) => {
  const LastModified = () => {
    if (object.LastModified) {
      return <IsomorphicDate time={object.LastModified.toDateString()} />;
    }
    return "N/A";
  };
  return (
    <>
      <div className="flex items-center">
        <div className="text-lg font-semibold">Object Info</div>
        <div className="ml-4 w-5">
          <InformationCircleIcon />
        </div>
      </div>
      const Date =<Detail title={"Key"}>{object.Key ?? "N/A"}</Detail>
      <Detail title={"ETag"}>{object.ETag}</Detail>
      <Detail title={"Last Modified"}>
        <LastModified />
      </Detail>
      <Detail title={"Size"}>{getHumanSize(object.Size ?? 0)}</Detail>
    </>
  );
};

interface BucketInspectorProps extends InspectorProps {
  objects: _Object[];
  onClose?: (_: React.MouseEvent<HTMLButtonElement>) => void;
  onDownload?: () => void;
  onDelete?: () => void;
}

export const BucketInspector = (props: BucketInspectorProps) => {
  const { objects, onClose, onDelete, onDownload } = props;

  let object: _Object;
  let title: string;

  switch (objects.length) {
    case 0:
      object = { Key: "N/A" };
      title = "N/A";
      break;
    case 1:
      object = objects[0];
      title = object.Key ?? "N/A";
      break;
    default:
      object = {
        Key: "Multiple values",
        ETag: "Multiple values",
        Size: objects.reduce((acc: number, value: _Object) => {
          return (acc += value.Size ?? 0);
        }, 0),
      };
      title = "Multiple values";
  }

  return (
    <div className="top-0 fixed z-10 right-0 w-64 bg-slate-300">
      <Inspector isOpen={props.isOpen}>
        <div className="flex p-4 flex-row-reverse">
          <button onClick={onClose}>
            <div
              className="w-5 p-[5px] bg-neutral-300 text-neutral-500
             hover:bg-neutral-400 rounded-full"
            >
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
    </div>
  );
};
