import { Button } from "@/components/Button";
import { FolderIcon } from "@heroicons/react/24/outline";
import { NewPathModal } from "./NewPathModal";
import { useState } from "react";

export type NewPathButton = {
  bucket: string;
  currentPath: string;
  onPathChange?: (newPath: string) => void;
};

export default function NewPathButton(props: NewPathButton) {
  const { bucket, currentPath, onPathChange } = props;
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleClick = () => {
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <NewPathModal
        open={isModalOpen}
        prefix={bucket}
        currentPath={currentPath}
        onClose={handleModalClose}
        onPathChange={onPathChange}
      />
      <Button title="New path" icon={<FolderIcon />} onClick={handleClick} />
    </>
  );
}
