import { Button } from "@/components/buttons";
import { toaster } from "@/components/toaster";
import { ArrowDownCircleIcon } from "@heroicons/react/24/outline";
import { getPresignedUrlsMap } from "./actions";

export default function DownloadButton(props: {
  bucket: string;
  objectsToDownloads: string[];
}) {
  const { bucket, objectsToDownloads: objectsToDownload } = props;

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
      .catch(err => {
        console.error(err);
        let message = "Unknown Error";
        if (err instanceof Error) {
          switch (err.message) {
            case "AccessDenied":
              message = "Access Denied";
            default:
          }
        }
        toaster.danger("Cannot download file(s)", message);
      });
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
