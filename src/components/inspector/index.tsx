// SPDX-FileCopyrightText: 2025 Istituto Nazionale di Fisica Nucleare
//
// SPDX-License-Identifier: EUPL-1.2

import { ReactNode } from "react";
import { Transition } from "@headlessui/react";

export interface InspectorProps {
  children?: ReactNode;
  isOpen: boolean;
}
export const Inspector = ({ isOpen, children }: InspectorProps) => {
  return (
    <Transition
      show={isOpen}
      enter="transition-transform duration-200"
      enterFrom="translate-x-64"
      enterTo="translate-x-0"
      leave="transition-transform duration-200"
      leaveFrom="translate-x-0"
      leaveTo="translate-x-64"
    >
      <div className="fixed top-16 right-0 z-30 h-screen w-64 drop-shadow drop-shadow-black/10 sm:w-80 lg:top-0 dark:drop-shadow-white/10">
        <div className="text-primary dark:text-secondary dark:bg-primary shadow-2xl] h-full bg-gray-50">
          {children}
        </div>
      </div>
    </Transition>
  );
};
