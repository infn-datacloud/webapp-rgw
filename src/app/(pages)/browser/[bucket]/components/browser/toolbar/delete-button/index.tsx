import { Button } from "@/components/buttons";
import { _Object } from "@aws-sdk/client-s3";
import { TrashIcon } from "@heroicons/react/24/outline";
import { deleteObjects } from "./actions";
import { toaster } from "@/components/toaster";

export default function DeleteButton(props: {
  bucket: string;
  objectsToDelete: string[];
  onDeleted?: () => void;
}) {
  const { bucket, objectsToDelete, onDeleted } = props;

  const deleteObjs = () => {
    const _delete = async () => {
      const error = await deleteObjects(bucket, objectsToDelete);
      if (!error) {
        onDeleted?.();
        toaster.success("Object(s) successfully deleted");
      } else {
        toaster.danger("Cannot delete object(s)", error);
      }
    };
    _delete();
  };

  return (
    <Button
      title="Delete file(s)"
      onClick={deleteObjs}
      disabled={objectsToDelete.length === 0}
      className="btn-danger-secondary w-full justify-center"
    >
      <TrashIcon className="size-5" />
      Delete file(s)
    </Button>
  );
}
