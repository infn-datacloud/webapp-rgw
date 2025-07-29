// SPDX-FileCopyrightText: 2025 Istituto Nazionale di Fisica Nucleare
//
// SPDX-License-Identifier: EUPL-1.2

"use client";

import { Button } from "@/components/buttons";
import { MinusIcon, PlusIcon } from "@heroicons/react/24/outline";
import { ChangeEvent, useState } from "react";
import "./style.css";

type NumberPickerProps = {
  min?: number;
  max?: number;
  defaultValue?: number;
  onChange?: (value: number) => void;
};

export function NumberPicker(props: Readonly<NumberPickerProps>) {
  const { min, max, defaultValue, onChange } = props;
  const [value, setValue] = useState<string>((defaultValue ?? 0).toString());

  function increase() {
    let v = parseInt(value);
    v = max !== undefined ? Math.min(max, v + 1) : v + 1;
    setValue(v.toString());
    onChange?.(v);
  }

  function decrease() {
    let v = parseInt(value);
    v = min !== undefined ? Math.max(min, v - 1) : v - 1;
    setValue(v.toString());
    onChange?.(v);
  }

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.value) {
      let v = parseInt(e.target.value);
      console.log(e.target.value, v);
      v = min !== undefined ? Math.max(min, v) : v;
      v = max !== undefined ? Math.min(max, v) : v;
      onChange?.(v);
      setValue(v.toString());
    } else {
      setValue(e.target.value);
    }
  };

  return (
    <div className="flex rounded border border-gray-300">
      <Button
        title="remove 1 hour"
        onClick={decrease}
        className="dark:text-secondary flex size-8 items-center justify-center bg-neutral-50 dark:bg-white/20 dark:hover:bg-white/30"
      >
        <MinusIcon className="size-5" />
      </Button>
      <div className="flex size-8 items-center justify-center border-x border-gray-300">
        <input
          value={value.toString()}
          onChange={handleChange}
          type="number"
          className="size-5 text-center"
        />
      </div>
      <Button
        title="add 1 hour"
        onClick={increase}
        className="dark:text-secondary flex size-8 items-center justify-center bg-neutral-50 dark:bg-white/20 dark:hover:bg-white/30"
      >
        <PlusIcon className="size-5" />
      </Button>
    </div>
  );
}
