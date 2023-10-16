import { XMarkIcon } from "@heroicons/react/24/outline";
import { Modal } from "../../components/Modal"
import { TextField } from "../../components/TextField";
import { ToggleSwitch, ToggleSwitchProps } from "../../components/ToggleSwitch";
import { ReactNode, useState } from "react";
import { Button } from "../../components/Button";
import { CreateBucketArgs } from "../../services/S3";

interface NewBucketModalProps {
  open: boolean;
  onClose: () => void;
  onCreateBucket: (args: CreateBucketArgs) => void;
}

const bucketValidator = new RegExp("(?!(^xn--|.+-s3alias$))^[a-z0-9][a-z0-9-.]{1,61}[a-z0-9]$");
const bucketInvalidErrorMessage = () => {
  return (
    <>
      <p className="text-xs font-bold mt-1">Bucket name is not valid.</p>
      <p className="text-xs">Bucket name must:</p>
      <ul className="list-disc text-xs ml-3">
        <li>be between 3(min) and 63(max) characters long.</li>
        <li>consist only of lowercase letters, numbers, dots(.), and hyphens(-).</li>
        <li>begin and end with a letter or number.</li>
        <li>not contain two adjacent periods.</li>
        <li>not be formatted as an IP addressa(for example, 192.168.5.4).</li>
        <li>not start with the prefix xn--.</li>
        <li>not end with the suffix - s3alias.</li>
        <li>not end with the suffix--ol - s3.</li>
      </ul>
    </>
  )
}

export const NewBucketModal = (props: NewBucketModalProps) => {
  const { open, onClose, onCreateBucket } = props;
  const [bucketName, setBucketName] = useState<string>("");
  const [error, setError] = useState<string | undefined | ReactNode>();
  const [versioningEnabled, setVersioningEnabled] = useState(false);
  const [objectLockEnabled, setObjectLockEnabled] = useState(false);

  const isBuketNameValid = (): boolean => {
    return bucketValidator.test(bucketName);
  }

  const validateBucketName = () => {
    setError(isBuketNameValid() ? undefined : bucketInvalidErrorMessage);
  }

  const clear = () => {
    setBucketName("");
    setError(null);
    setVersioningEnabled(false);
    setObjectLockEnabled(false);
  }

  const createBucket = () => {
    const args: CreateBucketArgs = {
      bucketName: bucketName,
      versioningEnabled: versioningEnabled,
      objectLockEnabled: objectLockEnabled
    };
    onCreateBucket(args);
  }

  // Components
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

  const Title = () => {
    return (
      <div className="flex place-content-between">
        <h1 className="text-2xl font-semibold">Create Bucket</h1>
        <CloseButton />
      </div>
    );
  }

  const BucketNameTextField = () => {
    return (
      <div className="flex justify-between mt-16">
        <div className="lg:w-52 my-auto">
          Bucket Name*
        </div>
        <TextField
          className="w-2/3 px-4"
          placeholder={"Enter a name for your bucket"}
          value={bucketName}
          onChange={(e) => setBucketName(e.target.value)}
          onBlur={() => validateBucketName()}
          error={error}
        />
      </div>
    );
  };

  interface BucketFeatureProps extends ToggleSwitchProps {
    name: string;
  }

  const BucketFeature = ({ name, checked, onClick }: BucketFeatureProps) => {
    return (
      <div className="flex justify-between">
        <p>{name}</p>
        <ToggleSwitch checked={checked} onClick={onClick} />
      </div>
    );
  };

  const BucketFeatures = () => {
    return (
      <div className="mt-4 space-y-4">
        <p className="font-bold">Features</p>
        <BucketFeature
          name="Versioning"
          checked={versioningEnabled}
          onClick={() => setVersioningEnabled(!versioningEnabled)}
        />
        <BucketFeature
          name="Object Lock"
          checked={objectLockEnabled}
          onClick={() => setObjectLockEnabled(!objectLockEnabled)}
        />
      </div>
    );
  };

  const Buttons = () => {
    return (
      <div className="flex justify-end p-4 space-x-4">
        <Button
          title="Clear"
          onClick={clear}
        />
        <Button
          title="Create Bucket"
          disabled={!isBuketNameValid()}
          onClick={createBucket}
        />
      </div>
    )
  }

  const bucketNameTextField = BucketNameTextField();
  return (
    <Modal open={open}>
      <div className="p-6">
        <Title />
        {bucketNameTextField}
        <BucketFeatures />
        <Buttons />
      </div>
    </Modal>
  );
};