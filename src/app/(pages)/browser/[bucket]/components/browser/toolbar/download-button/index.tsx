import { Button } from "@/components/buttons";
import { toaster } from "@/components/toaster";
import { ArrowDownCircleIcon } from "@heroicons/react/24/outline";
import { getPresignedUrlsMap } from "./actions";

export default function DownloadButton(props: {
  bucket: string;
  objectsToDownloads: string[];
}) {
  const { bucket, objectsToDownloads: objectsToDownload } = props;

  const downloadObjects = async () => {
    try {
      const urls = await getPresignedUrlsMap(bucket, objectsToDownload);
      const downloadObject = () => {
        const nextUrl = urls.pop();
        if (!nextUrl) {
          return;
        }
        const { url, key } = nextUrl;
        const a = document.createElement("a");
        a.href = url;
        a.download = key;
        a.target = "_self";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(downloadObject, 500);
      };
      downloadObject();
    } catch (err) {
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
    }
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
