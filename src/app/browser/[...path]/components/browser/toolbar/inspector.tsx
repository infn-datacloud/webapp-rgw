// SPDX-FileCopyrightText: 2025 Istituto Nazionale di Fisica Nucleare
//
// SPDX-License-Identifier: EUPL-1.2

import { XMarkIcon } from "@heroicons/react/24/outline";
import { _Object, CommonPrefix } from "@aws-sdk/client-s3";
import { Inspector, InspectorProps } from "@/components/inspector";
import { dateToHuman, getHumanSize } from "@/commons/utils";
import DeleteButton from "./delete-button";
import DownloadButton from "./download-button";
import { ShareButton } from "./share-button";

function getTitles(objects?: _Object[]) {
  if (!objects) {
    return { object: { Key: "N/A" }, title: "N/A" };
  }

  switch (objects.length) {
    case 0:
      return { object: { Key: "N/A" }, title: "N/A" };
    case 1:
      return { object: objects[0], title: objects[0].Key ?? "N/A" };
    default:
      return {
        object: {
          Key: `Multiple values (${objects.length})`,
          ETag: `Multiple values (${objects.length})`,
          Size: objects.reduce((acc: number, value?: _Object) => {
            acc += value?.Size ?? 0;
            return acc;
          }, 0),
        },
        title: `Multiple values (${objects.length})`,
      };
  }
}

interface BucketInspectorProps extends InspectorProps {
  bucket: string;
  objects: _Object[];
  prefixes: CommonPrefix[];
  onClose?: (_: React.MouseEvent<HTMLButtonElement>) => void;
  onDelete?: () => void;
}

export function BucketInspector(props: BucketInspectorProps) {
  const { bucket, isOpen, objects, prefixes, onClose, onDelete } = props;

  const keys = objects.filter(o => o?.Key).map(o => o.Key!) ?? [];
  let object: _Object;
  let title: string;

  if (prefixes.length === 0) {
    const r = getTitles(objects);
    object = r.object;
    title = r.title;
  } else {
    object = { Key: "N/A" };
    title = `Multiple values (${prefixes.length + objects.length})`;
  }

  const lastModified = object.LastModified
    ? dateToHuman(object.LastModified)
    : "N/A";

  return (
    <Inspector isOpen={isOpen}>
      <div className="flex justify-between border-b border-gray-300 bg-gray-100 p-4 dark:border-white/30 dark:bg-slate-600">
        <div className="text-lg font-semibold">{title}</div>
        <button onClick={onClose} className="mr-0">
          <div className="w-6 rounded-full bg-neutral-300 p-[3px] text-neutral-500 hover:bg-neutral-400">
            <XMarkIcon />
          </div>
        </button>
      </div>
      <div className="flex flex-col divide-y divide-slate-400 px-4">
        <section className="flex flex-col gap-4 py-8 text-base">
          <div className="flex flex-col break-all">
            <span className="dark:text-secondary/60 text-sm font-light text-slate-500">
              Etag
            </span>
            {object.ETag?.replaceAll('"', "")}
          </div>
          <div className="flex flex-col break-all">
            <span className="dark:text-secondary/60 text-sm font-light text-slate-500">
              Last Modified
            </span>
            {lastModified}
          </div>
          <div className="flex flex-col break-all">
            <span className="dark:text-secondary/60 text-sm font-light text-slate-500">
              Size
            </span>
            {object.Size ? getHumanSize(object.Size) : "N/A"}
          </div>
        </section>
        <section className="space-y-2 py-8">
          <DownloadButton bucket={bucket} objectsToDownloads={keys} />
          <ShareButton bucket={bucket} objectsToDownloads={keys} />
          <DeleteButton
            bucket={bucket}
            objectsToDelete={objects}
            foldersToDelete={prefixes}
            onDelete={onDelete}
          />
        </section>
      </div>
      {props.children}
    </Inspector>
  );
}
