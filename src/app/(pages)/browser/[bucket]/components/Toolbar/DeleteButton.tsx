import { Button } from "@/components/Button";
import { NotificationType, useNotifications } from "@/services/notifications";
import { _Object } from "@aws-sdk/client-s3";
import { TrashIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import { deleteObjects } from "../../actions";

export default function DeleteButton(props: {
  bucket: string;
  objectsToDelete: string[];
}) {
  const { bucket, objectsToDelete } = props;
  const router = useRouter();
  const { notify } = useNotifications();

  const deleteObjs = () => {
    deleteObjects(bucket, objectsToDelete)
      .then(() => {
        router.refresh();
        notify("Object(s) successfully deleted", "", NotificationType.success);
      })
      .catch(err => {
        err instanceof Error
          ? notify("Cannot delete object(s)", err.name, NotificationType.error)
          : console.error(err);
      });
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
