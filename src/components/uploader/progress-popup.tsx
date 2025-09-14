// SPDX-FileCopyrightText: 2025 Istituto Nazionale di Fisica Nucleare
//
// SPDX-License-Identifier: EUPL-1.2

import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { FileObjectWithProgress } from "@/models/bucket";
import {
  Button,
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
} from "@headlessui/react";
import { useState } from "react";
import ProgressBar from "./progress-bar";
import { ConfirmationModal } from "./modal";

interface ProgressPopupProps {
  title?: string;
  show: boolean;
  allCompleted: boolean;
  progressList: FileObjectWithProgress[];
  onClose?: () => void;
  onAbort?: (file: FileObjectWithProgress) => void;
  onAbortAll?: () => void;
}

export function ProgressPopup(props: Readonly<ProgressPopupProps>) {
  const {
    title,
    show,
    allCompleted,
    progressList,
    onClose,
    onAbort,
    onAbortAll,
  } = props;

  const [showModal, setShowModal] = useState(false);

  function close() {
    if (allCompleted) {
      onClose?.();
    } else {
      setShowModal(true);
    }
  }

  return (
    <>
      <Disclosure
        as="div"
        className="text-primary dark:text-secondary dark:border-secondary/10 fixed right-4 bottom-4 z-30 w-lg rounded bg-white p-4 shadow-lg transition ease-in-out data-[closed=true]:scale-0 data-[closed=true]:opacity-0 dark:border dark:bg-slate-800"
        defaultOpen={true}
        data-closed={!show}
      >
        <div className="flex justify-between">
          <p className="font-bold">{title}</p>
          <DisclosureButton className="dark:bg-secondary/10 dark:hover:bg-secondary/20 rounded-full p-2 hover:bg-neutral-200 data-open:rotate-180">
            <ChevronDownIcon className="dark:text-secondary text-primary size-4" />
          </DisclosureButton>
        </div>
        <DisclosurePanel
          transition
          className="origin-bottom transition duration-200 ease-out data-closed:-translate-y-6 data-closed:opacity-0"
        >
          {progressList.map(file => {
            return <ProgressBar key={file.id} file={file} onAbort={onAbort} />;
          })}
          <div className="flex justify-end">
            <Button className="btn-tertiary" onClick={close} type="button">
              {`${allCompleted ? "Close" : "Cancel uploads"}`}
            </Button>
          </div>
        </DisclosurePanel>
      </Disclosure>
      <ConfirmationModal
        show={showModal}
        onClose={() => setShowModal(false)}
        abortAll={onAbortAll}
      />
    </>
  );
}
