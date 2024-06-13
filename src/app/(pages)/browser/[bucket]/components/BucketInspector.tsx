import { Inspector, InspectorProps } from "@/components/Inspector";
import IsomorphicDate from "@/components/IsomorphicDate";
import { _Object } from "@aws-sdk/client-s3";
import { getHumanSize } from "@/commons/utils";
import DeleteButton from "./Toolbar/DeleteButton";
import DownloadButton from "./DownloadButton";
import { InformationCircleIcon, XMarkIcon } from "@heroicons/react/24/outline";

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
    <Inspector isOpen={isOpen}>
      <div className="flex flex-row-reverse p-4">
        <button onClick={onClose}>
          <div className="w-6 rounded-full bg-neutral-300 p-[3px] text-neutral-500 hover:bg-neutral-400">
            <XMarkIcon />
          </div>
        </button>
      </div>
      <div className="flex flex-col divide-y px-4">
        {/* Title */}
        <section className="py-4">
          <div className="break-words text-lg font-semibold">{title}</div>
        </section>
        {/* Buttons */}
        <section className="space-y-4 py-4">
          <DownloadButton bucket={bucket} objectsToDownloads={keys} />
          <DeleteButton
            bucket={bucket}
            objectsToDelete={keys}
            onDeleted={onDelete}
          />
          {/* Details */}
        </section>
        <section className="py-4">
          <ObjectDetail {...object} />
        </section>
      </div>
      {props.children}
    </Inspector>
  );
};
