import { _Object, CommonPrefix } from "@aws-sdk/client-s3";
import { Button } from "@/components/buttons";
import { TrashIcon } from "@heroicons/react/24/outline";
import { toaster } from "@/components/toaster";
import { deleteAll } from "./actions";
import { parseS3Error } from "@/commons/utils";

type DeleteButtonProps = {
  bucket: string;
  objectsToDelete: _Object[];
  foldersToDelete: CommonPrefix[];
  onDeleted?: () => void;
};

export default function DeleteButton(props: Readonly<DeleteButtonProps>) {
  const { bucket, objectsToDelete, foldersToDelete, onDeleted } = props;

  const _delete = async () => {
    try {
      await deleteAll(bucket, objectsToDelete, foldersToDelete);
      toaster.success("Object(s) successfully deleted");
      onDeleted?.();
    } catch (err) {
      const error = parseS3Error(err);
      toaster.danger("Cannot delete object(s)", error);
    }
  };

  return (
    <Button
      title="Delete file(s)"
      icon={<TrashIcon />}
      onClick={_delete}
      disabled={objectsToDelete.length + foldersToDelete.length === 0}
      color="danger-outline"
    />
  );
}
