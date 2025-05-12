import { _Object, CommonPrefix } from "@aws-sdk/client-s3";
import { Button } from "@/components/buttons";
import { TrashIcon } from "@heroicons/react/24/outline";
import { ConfirmationModal } from "./modal";
import { useState } from "react";

type DeleteButtonProps = {
  bucket: string;
  objectsToDelete: _Object[];
  foldersToDelete: CommonPrefix[];
};

export default function DeleteButton(props: Readonly<DeleteButtonProps>) {
  const { bucket, objectsToDelete, foldersToDelete } = props;
  const [show, setShow] = useState(false);

  const open = () => setShow(true);
  const close = () => setShow(false);

  return (
    <>
      <ConfirmationModal
        show={show}
        bucket={bucket}
        objectsToDelete={objectsToDelete}
        foldersToDelete={foldersToDelete}
        onClose={close}
      />
      <Button
        className="btn-danger w-full"
        title="Delete file(s)"
        onClick={open}
        disabled={objectsToDelete.length + foldersToDelete.length === 0}
      >
        <TrashIcon className="size-5" />
        Delete file(s)
      </Button>
    </>
  );
}
