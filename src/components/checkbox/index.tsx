// SPDX-FileCopyrightText: 2025 Istituto Nazionale di Fisica Nucleare
//
// SPDX-License-Identifier: EUPL-1.2

import { Checkbox as HeadlessCheckbox } from "@headlessui/react";
import { CheckIcon } from "@heroicons/react/16/solid";

export interface CheckboxState<T> {
  checked: boolean;
  underlying: T;
  index: number;
}

type CheckboxProps = {
  checked?: boolean;
  onChange?: (value: boolean) => void;
};

export function Checkbox(props: Readonly<CheckboxProps>) {
  const { checked, onChange } = props;

  return (
    <HeadlessCheckbox
      checked={checked}
      onChange={onChange}
      className="group flex aspect-square size-4 items-center rounded border border-slate-300 bg-white/10 ring-1 ring-white/15 ring-inset focus:not-data-focus:outline-none data-checked:bg-white data-focus:outline data-focus:outline-offset-2 data-focus:outline-white"
    >
      <CheckIcon className="m-auto hidden size-4 fill-gray-700 group-data-[checked]:block" />
    </HeadlessCheckbox>
  );
}
