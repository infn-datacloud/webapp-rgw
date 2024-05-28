import { camelToWords } from "@/commons/utils";
import { Button } from "@/components/Button";
import { NotificationType } from "@/services/notifications/types";
import { useNotifications } from "@/services/notifications/useNotifications";
import { ArrowDownCircleIcon } from "@heroicons/react/24/outline";
import { getPresignedUrlsMap } from "../actions";

export default function DownloadButton(props: {
  bucket: string;
  objectsToDownloads: string[];
}) {
  const { bucket, objectsToDownloads: objectsToDownload } = props;
  const { notify } = useNotifications();

  const downloadObjects = () => {
    getPresignedUrlsMap(bucket, objectsToDownload)
      .then(urls => {
        const link = document.createElement("a");
        link.onclick = () => {
          urls.map(el => window.open(el.url, "_blank"));
        };
        document.body.appendChild(link);
        link.click();
        link.parentNode?.removeChild(link);
      })
      .catch(err =>
        err instanceof Error
          ? notify(
              "Cannot download file(s)",
              camelToWords(err.name),
              NotificationType.error
            )
          : console.error(err)
      );
  };

  return (
    <Button
      title="Download file(s)"
      icon={<ArrowDownCircleIcon />}
      onClick={downloadObjects}
      disabled={objectsToDownload.length === 0}
    />
  );
}
