import { Button } from "@/components/Button";
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
    const promises = objectsToDownloads.map(o => s3.getPresignedUrl(bucket, o));
    Promise.all(promises).then(urls => {
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

      // if (err instanceof Error) {
      //   notify(
      //     "Cannot download file(s)",
      //     camelToWords(err.name),
      //     NotificationType.error
      //   );
      // } else {
      //   console.error(err);
      // }
    });
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
