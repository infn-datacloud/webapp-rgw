"use client";

import { getHumanSize } from "@/commons/utils";
import { _Object } from "@aws-sdk/client-s3";
import { Checkbox, CheckboxState } from "@/components/checkbox";
import { FileIcon } from "./file-icon";

type ObjectRowProps = {
  state: CheckboxState<_Object>;
  onChange?: (state: CheckboxState<_Object>, value: boolean) => void;
};

export function ObjectRow(props: Readonly<ObjectRowProps>) {
  const { state, onChange } = props;
  const object = state.underlying;

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

  const toggle = () => {
    onChange?.(state, !state.checked);
  };

  return (
    <li>
      <button
        className="flex w-full items-center gap-2 border-b border-slate-200 bg-white p-4 text-left hover:bg-slate-100"
        onClick={toggle}
      >
        <Checkbox checked={state.checked} />
        <div className="min-w-8">
          <FileIcon extension={extension} />
        </div>
        <div className="grow">{fileName}</div>
        <div className="min-w-80">{lastModified}</div>
        <div className="min-w-20">{size}</div>
      </button>
    </li>
  );
}
