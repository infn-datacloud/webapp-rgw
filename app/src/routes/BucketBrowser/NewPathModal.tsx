import { useState, useEffect } from "react";
import { CheckIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { Button } from "../../components/Button";
import { Modal } from "../../components/Modal";
import { TextField } from "../../components/TextField";
import { addKeyHandler } from "../../commons/utils";

interface ModalProps {
  open: boolean;
  prefix?: string;
  currentPath: string;
  onClose: (path: string) => void;
}

export const NewPathModal = (props: ModalProps) => {
  const { open, prefix, currentPath, onClose } = props;
  const [path, setPath] = useState<string>("");

  useEffect(() => {
    if (!open) {
      return;
    }
    const cleanupKeyHandler = addKeyHandler("Enter", () => {
      handleClose();
    });
    return () => {
      cleanupKeyHandler();
    };
  }),
    [open];

  const handleClose = () => {
    onClose(path);
    setPath("");
  };

  // TODO: expand
  const pathIsValid = () => {
    return path !== "";
  };

  const CloseButton = () => {
    return (
      <button
        className="w-8 p-[5px] text-neutral-500
      hover:bg-neutral-200 rounded-full"
        onClick={() => {
          onClose("");
          setPath("");
        }}
      >
        <XMarkIcon />
      </button>
    );
  };

  return (
    <Modal open={open}>
      <div className="p-6">
        <div className="flex place-content-between">
          <h1 className="text-2xl font-semibold">
            Choose or create a new path
          </h1>
          <CloseButton />
        </div>

        <div className="flex mt-8">
          <h2 className="font-semibold mr-2">Current Path: </h2>
          {prefix + currentPath}
        </div>
        <div className="mt-16 flex space-x-8 content-center">
          <div className="lg:w-52 my-auto">New Folder Path</div>
          <TextField
            placeholder={"Enter the new Folder Path"}
            value={path}
            onChange={e => setPath(e.target.value)}
          />
        </div>
        <div className="flex place-content-between mt-16">
          <div></div>
          <div>
            <div className="flex space-x-4">
              <Button
                title="Clear"
                icon={<XMarkIcon />}
                onClick={() => setPath("")}
              />
              <Button
                title="Confirm"
                icon={<CheckIcon />}
                disabled={!pathIsValid()}
                onClick={handleClose}
              />
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
