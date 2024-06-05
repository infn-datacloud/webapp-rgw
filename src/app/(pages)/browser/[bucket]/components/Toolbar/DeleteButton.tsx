import { Button } from "@/components/Button";
import { _Object } from "@aws-sdk/client-s3";
import { TrashIcon } from "@heroicons/react/24/outline";
import { deleteObjects } from "../../actions";
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
        toaster.danger("Cannot delete object(s)", error.message);
      }
    };
    _delete();
  };

  return (
    <Button
      title="Delete file(s)"
      icon={<TrashIcon />}
      onClick={deleteObjs}
      disabled={objectsToDelete.length === 0}
    />
  );
}
