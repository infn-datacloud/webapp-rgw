import { Button } from "@/components/Button";
import { NotificationType, useNotifications } from "@/services/notifications";
import { _Object } from "@aws-sdk/client-s3";
import { TrashIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import { deleteObjects } from "../../actions";

export default function DeleteButton(props: {
  bucket: string;
  objectsToDelete: string[];
  onDeleted?: () => void;
}) {
  const { bucket, objectsToDelete, onDeleted } = props;
  const router = useRouter();
  const { notify } = useNotifications();

  const deleteObjs = () => {
    const _delete = async () => {
      const error = await deleteObjects(bucket, objectsToDelete);
      if (!error) {
        onDeleted?.();
        notify("Object(s) successfully deleted", "", NotificationType.success);
        router.refresh();
      } else {
        notify(
          "Cannot delete object(s)",
          error.message,
          NotificationType.error
        );
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
