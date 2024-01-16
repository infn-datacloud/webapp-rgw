import { XMarkIcon } from "@heroicons/react/24/outline";
import { Modal } from "../../components/Modal";
import { TextField } from "../../components/TextField";
import { ReactNode, useState, useEffect, useCallback } from "react";
import { Button } from "../../components/Button";
import { useBucketStore } from "../../services/BucketStore";
import {
  useNotifications,
  NotificationType,
} from "../../services/Notifications";
import { addKeyHandler } from "../../commons/utils";

interface MountBucketModalProps {
  open: boolean;
  onClose: () => void;
}

export const MountBucketModal = (props: MountBucketModalProps) => {
  const { open, onClose } = props;
  const [bucketName, setBucketName] = useState<string>("");
  const [error, setError] = useState<string | undefined | ReactNode>();
  const store = useBucketStore();
  const { notify } = useNotifications();

  const clear = useCallback(() => {
    setBucketName("");
    setError(null);
  }, []);

  const close = useCallback(async () => {
    clear();
    onClose();
  }, [clear, onClose]);

  const mountBucket = useCallback(
    async (bucket: string) => {
      if (await store.mountBucket({ Name: bucket })) {
        notify(
          `Bucket ${bucket} successfully mounted`,
          "",
          NotificationType.success
        );
        close();
      } else {
        setError("Cannot mount bucket");
      }
    },
    [close, store, notify]
  );

  useEffect(() => {
    if (!open) {
      return;
    }
    const cleanupKeyHandler = addKeyHandler("Enter", () => {
      mountBucket(bucketName);
      close();
    });
    return () => {
      cleanupKeyHandler();
    };
  }, [open, close, bucketName, mountBucket]);

  // Components
  const CloseButton = () => {
    return (
      <button
        className="w-8 p-[5px] text-neutral-500
      hover:bg-neutral-200 rounded-full"
        onClick={() => {
          onClose();
        }}
      >
        <XMarkIcon />
      </button>
    );
  };

  const Title = () => {
    return (
      <div className="flex place-content-between">
        <h1 className="text-2xl font-semibold">Mount Bucket</h1>
        <CloseButton />
      </div>
    );
  };

  const BucketNameTextField = () => {
    return (
      <div className="flex justify-between mt-16">
        <div className="lg:w-52 my-auto">Bucket Name*</div>
        <TextField
          className="w-2/3 px-4"
          placeholder={"Enter a name for your bucket"}
          value={bucketName}
          onChange={e => setBucketName(e.target.value)}
          error={error}
        />
      </div>
    );
  };

  const Buttons = () => {
    return (
      <div className="flex justify-end p-4 space-x-4">
        <Button title="Clear" onClick={clear} />
        <Button title="Mount Bucket" onClick={() => mountBucket(bucketName)} />
      </div>
    );
  };

  const bucketNameTextField = BucketNameTextField();
  return (
    <Modal open={open}>
      <div className="p-6">
        <Title />
        {bucketNameTextField}
        <Buttons />
      </div>
    </Modal>
  );
};
