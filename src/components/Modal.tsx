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
    <div className="bottom-0 min-h-8 pt-4 flex justify-end space-x-2">
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
        className="relative z-10 focus:outline-none"
        onClose={onClose}
      >
        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-32 mt-16 justify-center p-4">
            {/* Backdrop */}
            <TransitionChild
              enter="ease-out duration-300"
              enterFrom="opacity-0 transform-[scale(95%)]"
              enterTo="opacity-100 transform-[scale(100%)]"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 transform-[scale(100%)]"
              leaveTo="opacity-0 transform-[scale(95%)]"
            >
              <div
                className="fixed inset-0 bg-black/30 z-25"
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
              <DialogPanel className="text-primary w-full max-w-lg rounded z-30 bg-secondary p-4 divide-y">
                <DialogTitle as="h2" className="font-bold text-xl pb-2">
                  <div className="flex justify-between">
                    {title}
                    <button onClick={onClose}>
                      <div className="w-6 p-[3px] bg-neutral-300
                          text-neutral-500 hover:bg-neutral-400 rounded-full"
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
