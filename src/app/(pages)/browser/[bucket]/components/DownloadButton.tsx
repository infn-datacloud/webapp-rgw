import { camelToWords } from "@/commons/utils";
import { Button } from "@/components/Button";
import { NotificationType } from "@/services/notifications/types";
import { useNotifications } from "@/services/notifications/useNotifications";
import { S3Service } from "@/services/s3";
import { s3ClientConfig } from "@/services/s3/actions";
import { ArrowDownCircleIcon } from "@heroicons/react/24/outline";
import { useSession } from "next-auth/react";
import { useEffect, useRef } from "react";

export default function DownloadButton(props: {
  bucket: string;
  objectsToDownloads: string[];
}) {
  const { bucket, objectsToDownloads } = props;
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

  const downloadObjects = () => {
    const s3 = s3Ref.current;
    if (!s3) {
      throw new Error("Cannot initialize S3 service");
    }
    const download = async () => {
      try {
        const promises = objectsToDownloads.map(o =>
          s3.getPresignedUrl(bucket, o)
        );
        const urls = await Promise.all(promises);
        const kv_urls = urls.map((url, i) => {
          return { key: objectsToDownloads[i], url: url };
        });
        const link = document.createElement("a");
        link.onclick = () => {
          kv_urls.map(el => window.open(el.url, "_blank"));
        };
        document.body.appendChild(link);
        link.click();
        link.parentNode?.removeChild(link);
      } catch (err) {
        if (err instanceof Error) {
          notify(
            "Cannot download file(s)",
            camelToWords(err.name),
            NotificationType.error
          );
        } else {
          console.error(err);
        }
      }
    };
    download();
  };

  return (
    <Button
      title="Download file(s)"
      icon={<ArrowDownCircleIcon />}
      onClick={downloadObjects}
      disabled={objectsToDownloads.length === 0}
    />
  );
}
