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
import { useS3Service } from "../services/S3Service";

interface BucketInspectorProps extends InspectorProps {
  bucket: string;
  objects: BucketObject[]
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
      <Detail title={"Last Modified"} value={object.LastModified?.toString()} />
      <Detail title={"Owner"} value={object.Owner?.ID} />
      <Detail title={"Size"} value={getHumanSize(object.Size ?? 0)} />
    </>
  )
}


export const BucketInspector = (props: BucketInspectorProps) => {

  const { bucket, objects } = props;
  const title = objects.length === 1 ? objects[0].Key : "Multiple objects";
  const object = objects[0];
  const { getPresignedUrl } = useS3Service();

  const downloadObject = async () => {
    try {
      const url = await getPresignedUrl(bucket, object.Key!);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', object.Key!);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
    }
  }

  const Title = () => {
    return (
      <div className="text-xl font-semibold">
        {title}
      </div>
    )
  }


  return (
    <Inspector
      isOpen={props.isOpen}>
      <div className="flex items-center p-4">
        <Title />
        <button>
          <div
            className="w-8 p-[5px] bg-neutral-300 text-neutral-500
             hover:bg-neutral-400 rounded-full">
            <XMarkIcon />
          </div>
        </button>
      </div>
      <div className="p-4">
        <Button
          className="w-full"
          title="Download"
          icon={<ArrowDownCircleIcon />}
          onClick={downloadObject}
        />
        <Button className="w-full mt-4" title="Delete" icon={<TrashIcon />} />
        <hr className="h-px w-full my-8 bg-gray-200 border-0 dark:bg-gray-700"></hr>
        <ObjectDetail {...object} />
      </div>
      {props.children}

    </Inspector>
  )
}
