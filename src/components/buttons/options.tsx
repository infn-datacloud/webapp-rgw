// SPDX-FileCopyrightText: 2025 Istituto Nazionale di Fisica Nucleare
//
// SPDX-License-Identifier: EUPL-1.2

import { Popover, PopoverButton, PopoverPanel } from "@headlessui/react";
import { EllipsisHorizontalIcon } from "@heroicons/react/24/solid";

type OptionsProps = {
  children: React.ReactNode;
};

export function Options(props: Readonly<OptionsProps>) {
  const { children } = props;
  return (
    <Popover className="relative size-8">
      <PopoverButton>
        <EllipsisHorizontalIcon className="text-primary/70 dark:text-secondary/70 size-8" />
      </PopoverButton>
      <PopoverPanel
        anchor="bottom"
        className="bg-secondary flex min-w-24 flex-col rounded-lg text-left shadow-xl dark:bg-slate-600 dark:drop-shadow-white/10"
      >
        {children}
      </PopoverPanel>
    </Popover>
  );
}
