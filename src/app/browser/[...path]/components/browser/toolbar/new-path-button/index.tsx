// SPDX-FileCopyrightText: 2025 Istituto Nazionale di Fisica Nucleare
//
// SPDX-License-Identifier: EUPL-1.2

import { Button } from "@/components/buttons";
import { FolderIcon } from "@heroicons/react/24/outline";
import { NewPathModal } from "./modal";
import { useState } from "react";

export type NewPathButton = {
  currentPath: string;
  onPathChange?: (newPath: string) => void;
};

export default function NewPathButton(props: NewPathButton) {
  const { currentPath, onPathChange } = props;
  const [showModal, setShowModal] = useState(false);

  const open = () => setShowModal(true);
  const close = () => setShowModal(false);

  return (
    <>
      <NewPathModal
        show={showModal}
        currentPath={currentPath}
        onPathChange={onPathChange}
        onClose={close}
      />
      <Button
        title="New path"
        onClick={open}
        type="button"
        className="btn-secondary"
      >
        <FolderIcon className="size-5" />
        New path
      </Button>
    </>
  );
}
