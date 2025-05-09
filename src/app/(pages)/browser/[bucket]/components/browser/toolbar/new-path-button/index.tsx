import { Button } from "@/components/buttons";
import { FolderIcon } from "@heroicons/react/24/outline";
import { NewPathModal } from "./modal";
import { useState } from "react";

export type NewPathButton = {
  bucket: string;
  currentPath: string;
  onPathChange?: (newPath: string) => void;
};

export default function NewPathButton(props: NewPathButton) {
  const { bucket, currentPath, onPathChange } = props;
  const [showModal, setShowModal] = useState(false);

  const open = () => setShowModal(true);
  const close = () => setShowModal(false);

  return (
    <>
      <NewPathModal
        show={showModal}
        prefix={bucket}
        currentPath={currentPath}
        onPathChange={onPathChange}
        onClose={close}
      />
      <Button
        title="New path"
        onClick={open}
        type="button"
        className="btn-secondary items-center"
      >
        <FolderIcon className="size-5" />
        New path
      </Button>
    </>
  );
}
