import { Button } from "@/components/Button";
import { S3Service } from "@/services/s3";
import { s3ClientConfig } from "@/services/s3/actions";
import { _Object } from "@aws-sdk/client-s3";
import { TrashIcon } from "@heroicons/react/16/solid";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

export default function DeleteButton(props: {
  bucket: string;
  selectedObjects: _Object[];
}) {
  const { bucket, selectedObjects } = props;
  const router = useRouter();
  const { status, data } = useSession();
  const s3Ref = useRef<S3Service | null>(null);

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
    const promises = selectedObjects.map(o => s3.deleteObject(bucket, o.Key!));
    Promise.all(promises).then(() => console.log("Object(s) deleted"));
    router.refresh();
  };

  return (
    <Button
      title="Delete file(s)"
      icon={<TrashIcon />}
      onClick={deleteObjects}
      disabled={selectedObjects.length === 0}
    />
  );
}
