import { XMarkIcon } from "@heroicons/react/24/outline";
import { ReactNode } from "react"

interface DownloadStatusPopupProps {
  children?: ReactNode;
  show: boolean;
  onClose: () => void;
  upload?: boolean;
}

export const DownloadStatusPopup = (
  { children, show, onClose, upload = false }: DownloadStatusPopupProps) => {
  const CloseButton = () => {
    return (
      <button className="w-8 p-[5px] text-neutral-500
      hover:bg-neutral-200 rounded-full"
        onClick={() => {
          onClose();
        }}>
        <XMarkIcon />
      </button>
    )
  }

  if (!show) {
    return <></>
  }

  const title = upload ? "Uploading" : "Downloading";

  return (
    <div className="z-50 fixed bottom-4 right-4 w-72 bg-white p-4 shadow-lg rounded">
      <div className="flex justify-between">
        <p className="font-bold">{title}</p>
        <CloseButton />
      </div>
      {children}
    </div>
  );
};