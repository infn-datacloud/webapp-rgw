import { CheckIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { Button } from "../../components/Button";
import { Modal } from "../../components/Modal";
import { TextField } from "../../components/TextField";
import { useState } from "react";

interface ModalProps {
  open: boolean;
  bucketName: string;
  currentPath: string;
  onClose: (path: string) => void;
}

export const NewPathModal = (props: ModalProps) => {
  const { open, bucketName, currentPath, onClose } = props;
  const [path, setPath] = useState<string>("");

  const handleClose = () => {
    onClose(currentPath !== "" ? currentPath + '/' + path : path);
    setPath("");
  }

  // TODO: expand
  const pathIsValid = () => {
    return path !== "";
  }

  const CloseButton = () => {
    return (
      <button className="w-8 p-[5px] text-neutral-500
      hover:bg-neutral-200 rounded-full"
        onClick={() => handleClose()}>
        <XMarkIcon />
      </button>
    )
  }

  return (
    <Modal open={open}>
      <div className="p-6">
        <div className="flex place-content-between">
          <h1 className="text-2xl font-semibold">
            Choose or create a new path
          </h1>
          <CloseButton />
        </div>

        <h2 className="mt-8 font-semibold">
          Current Path:
        </h2>

        <p className="mb-16">{bucketName + '/' + currentPath}</p>
        <div className="mt-16 flex space-x-8 content-center">
          <div className="lg:w-52 my-auto">
            New Folder Path
          </div>
          <TextField
            placeholder={"Enter the new Folder Path"}
            value={path}
            onChange={(e) => setPath(e.target.value)}
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
  )
}
