import { Button } from "@/components/Button";
import { NotificationType, useNotifications } from "@/services/notifications";
import { S3Service } from "@/services/s3";
import { s3ClientConfig } from "@/services/s3/actions";
import { _Object } from "@aws-sdk/client-s3";
import { TrashIcon } from "@heroicons/react/24/outline";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

export default function DeleteButton(props: {
  bucket: string;
  objectsToDelete: string[];
}) {
  const { bucket, objectsToDelete } = props;
  const router = useRouter();
  const { status, data } = useSession();
  const s3Ref = useRef<S3Service | null>(null);
  const { notify } = useNotifications();

  useEffect(() => {
    if (status === "authenticated") {
      if (!data || !data.credentials) {
        throw new Error("Session not found");
      }
      s3ClientConfig(data.credentials).then(
        config => (s3Ref.current = new S3Service(config))
      );
    }
  }, [status, data]);

  const deleteObjects = () => {
    const s3 = s3Ref.current;
    if (!s3) {
      throw new Error("Cannot initialize S3 service");
    }
    const del = async () => {
      const promises = objectsToDelete.map(o => s3.deleteObject(bucket, o));
      try {
        await Promise.all(promises);
        router.refresh();
        notify("Object(s) successfully deleted", "", NotificationType.success);
      } catch (err) {
        err instanceof Error
          ? notify("Cannot delete object(s)", err.name, NotificationType.error)
          : console.error(err);
      }
    };
    del();
  };

  return (
    <Button
      title="Delete file(s)"
      icon={<TrashIcon />}
      onClick={deleteObjects}
      disabled={objectsToDelete.length === 0}
    />
  );
}
