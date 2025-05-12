"use client";
import { ReactNode } from "react";
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";

export interface ModalProps {
  title?: string;
  children?: ReactNode;
  show: boolean;
  onClose: () => void;
}

export const ModalBody = (props: { children?: ReactNode }) => {
  const { children } = props;
  return <div className="p-4">{children}</div>;
};

export const ModalFooter = (props: { children?: ReactNode }) => {
  const { children } = props;
  return (
    <div className="bottom-0 flex min-h-8 justify-end space-x-2 pt-4">
      {children}
    </div>
  );
};

export default function Modal(props: ModalProps) {
  const { title, children, show, onClose } = props;

  return (
    <Transition appear show={show}>
      <Dialog
        as="div"
        className="relative z-40 focus:outline-none"
        onClose={onClose}
      >
        <div className="fixed inset-0 z-40 w-screen overflow-y-auto">
          <div className="mt-16 flex min-h-32 justify-center p-4">
            {/* Backdrop */}
            <TransitionChild
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div
                className="fixed inset-0 z-25 bg-black/30"
                aria-hidden="true"
              />
            </TransitionChild>
            {/* Popup */}
            <TransitionChild
              enter="ease-out duration-300"
              enterFrom="opacity-0 transform-[scale(95%)]"
              enterTo="opacity-100 transform-[scale(100%)]"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 transform-[scale(100%)]"
              leaveTo="opacity-0 transform-[scale(95%)]"
            >
              <DialogPanel className="bg-secondary text-primary dark:text-secondary z-50 w-full max-w-lg divide-y rounded-lg p-4 dark:bg-slate-800">
                <DialogTitle className="border-gray-200 pb-2 text-xl font-bold">
                  <div className="flex justify-between">
                    {title}
                    <button onClick={onClose}>
                      <div
                        className="w-6 rounded-full bg-neutral-300 p-[3px] text-neutral-500 hover:bg-neutral-400"
                        aria-label="close"
                      >
                        <XMarkIcon />
                      </div>
                    </button>
                  </div>
                </DialogTitle>
                {children}
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
