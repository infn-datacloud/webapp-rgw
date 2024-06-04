import { Inspector, InspectorProps } from "@/components/Inspector";
import IsomorphicDate from "@/components/IsomorphicDate";
import { _Object } from "@aws-sdk/client-s3";
import { getHumanSize } from "@/commons/utils";
import DeleteButton from "./Toolbar/DeleteButton";
import DownloadButton from "./DownloadButton";
import { InformationCircleIcon, XMarkIcon } from "@heroicons/react/24/outline";

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
      <div className="text-md font-semibold">{title}</div>
      <div className="break-all">{children}</div>
    </div>
  );
};

const ObjectDetail = (object: _Object) => {
  const LastModified = () => {
    const { LastModified } = object;
    if (LastModified) {
      return <IsomorphicDate date={LastModified} />;
    }
    return "N/A";
  };
  return (
    <>
      <div className="flex items-center">
        <h3 className="text-lg font-semibold">Object Info</h3>
        <div className="ml-4 w-5">
          <InformationCircleIcon />
        </div>
      </div>
      <Detail title={"Key"}>{object.Key ?? "N/A"}</Detail>
      <Detail title={"ETag"}>{object.ETag}</Detail>
      <Detail title={"Last Modified"}>
        <LastModified />
      </Detail>
      <Detail title={"Size"}>{getHumanSize(object.Size ?? 0)}</Detail>
    </>
  );
};

interface BucketInspectorProps extends InspectorProps {
  bucket: string;
  objects: _Object[];
  onClose?: (_: React.MouseEvent<HTMLButtonElement>) => void;
  onDelete?: () => void;
}

export const BucketInspector = (props: BucketInspectorProps) => {
  const { bucket, isOpen, objects, onClose, onDelete } = props;
  const keys = objects.map(o => o.Key!);
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
        Key: `Multiple values (${objects.length})`,
        ETag: `Multiple values (${objects.length})`,
        Size: objects.reduce((acc: number, value: _Object) => {
          return (acc += value.Size ?? 0);
        }, 0),
      };
      title = `Multiple values (${objects.length})`;
  }

  return (
    <div className="top-0 fixed z-10 right-0 w-64 bg-slate-300">
      <Inspector isOpen={isOpen}>
        <div className="flex p-4 flex-row-reverse">
          <button onClick={onClose}>
            <div
              className="w-6 p-[3px] bg-neutral-300 text-neutral-500
             hover:bg-neutral-400 rounded-full"
            >
              <XMarkIcon />
            </div>
          </button>
        </div>
        <div className="px-4 column-1 space-y-3">
          <section>
            <Title className="w-5/6" title={title} />
            <hr className="mt-4"></hr>
          </section>
          <section className="space-y-3">
            <DownloadButton bucket={bucket} objectsToDownloads={keys} />
            <DeleteButton
              bucket={bucket}
              objectsToDelete={keys}
              onDeleted={onDelete}
            />
            <hr className="h-px w-full mt-4 bg-gray-200 border-0"></hr>
          </section>
          <section>
            <ObjectDetail {...object} />
          </section>
        </div>
        {props.children}
      </Inspector>
    </div>
  );
};
