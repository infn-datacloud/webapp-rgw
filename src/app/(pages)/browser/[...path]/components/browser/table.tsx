import {
  _Object,
  CommonPrefix,
  ListObjectsV2CommandOutput,
} from "@aws-sdk/client-s3";
import Link from "next/link";
import { FileIcon } from "./file-icon";
import { getHumanSize } from "@/commons/utils";
import Paginator from "@/components/paginator";

function Folder(
  props: Readonly<{ prefix: CommonPrefix; currentPath: string }>
) {
  const { prefix, currentPath } = props;
  const href = `${currentPath}/${prefix.Prefix}`;
  const folderName = prefix.Prefix?.split("/").splice(-2);
  return (
    <li className="flex border-b border-slate-200 p-4 hover:bg-slate-200">
      <Link className="flex w-full" href={href}>
        <div className="min-w-8">
          <FileIcon extension="folder" />
        </div>
        {folderName}
      </Link>
    </li>
  );
}

function Object(props: Readonly<{ object: _Object }>) {
  const { object } = props;
  const lastModified = (() => {
    const { LastModified } = object;
    if (!LastModified) {
      return "N/A";
    }
    return `${LastModified.toLocaleDateString()} ${LastModified.toLocaleTimeString()}`;
  })();

  const fileName = object.Key?.split("/").splice(-1);
  const extension = object.Key?.split(".").slice(-1)[0];
  const size = object.Size ? getHumanSize(object.Size) : "N/A";

  return (
    <li className="flex border-b border-slate-200 bg-white p-4 hover:bg-slate-200">
      <div className="min-w-8">
        <FileIcon extension={extension} />
      </div>
      <div className="grow">{fileName}</div>
      <div className="min-w-80">{lastModified}</div>
      <div className="min-w-20">{size}</div>
    </li>
  );
}

type ObjectTableProps = {
  listObjectsOutput: ListObjectsV2CommandOutput;
  currentPath: string;
};

export function ObjectTable(props: Readonly<ObjectTableProps>) {
  const { listObjectsOutput, currentPath } = props;
  const { Contents, CommonPrefixes, NextContinuationToken } = listObjectsOutput;
  return (
    <div className="rounded bg-slate-100 text-sm text-primary shadow-md">
      <div className="flex px-4 pb-2 pt-6">
        <div className="min-w-8" />
        <div className="grow font-bold">Name</div>
        <div className="min-w-80 font-bold">Last Modified</div>
        <div className="min-w-20 font-bold">Size</div>
      </div>
      <ul className="bg-white">
        {CommonPrefixes?.map(prefix => (
          <Folder
            key={prefix.Prefix}
            prefix={prefix}
            currentPath={currentPath}
          />
        ))}
        {Contents?.map(object => <Object key={object.Key} object={object} />)}
      </ul>
      <Paginator nextContinuationToken={NextContinuationToken} />
    </div>
  );
}
