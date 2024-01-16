import { useState } from "react";
import { Modal } from "../../components/Modal";
import { Button } from "../../components/Button";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { ToggleSwitch, ToggleSwitchProps } from "../../components/ToggleSwitch";

export interface BucketConfiguration {
  versioningEnabled: boolean;
  objectLockEnabled: boolean;
}

interface EditBucketModalProps extends BucketConfiguration {
  bucketName?: string;
  onClose: () => void;
  onUpdateBucket: (bucketName: string, config: BucketConfiguration) => void;
}

export const EditBucketModal = (props: EditBucketModalProps) => {
  const {
    bucketName,
    versioningEnabled,
    objectLockEnabled,
    onClose,
    onUpdateBucket,
  } = props;

  const [versioningWillBeEnabled, setVersioningWillBeEnabled] =
    useState(versioningEnabled);
  const [objectLockWillBeEnabled, setObjectLockWillBeEnabled] =
    useState(objectLockEnabled);

  const clear = () => {};

  const updateBucket = () => {
    const config: BucketConfiguration = {
      versioningEnabled: versioningWillBeEnabled,
      objectLockEnabled: objectLockWillBeEnabled,
    };
    onUpdateBucket(bucketName!, config);
  };

  const changed = () => {
    return (
      versioningWillBeEnabled !== versioningEnabled ||
      objectLockWillBeEnabled !== objectLockEnabled
    );
  };

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
          checked={versioningWillBeEnabled}
          onClick={() => setVersioningWillBeEnabled(!versioningWillBeEnabled)}
        />
        <BucketFeature
          name="Object Lock"
          checked={objectLockWillBeEnabled}
          onClick={() => setObjectLockWillBeEnabled(!objectLockWillBeEnabled)}
        />
      </div>
    );
  };

  const Title = () => {
    return (
      <div className="flex place-content-between">
        <h1 className="text-2xl font-semibold">{`Edit ${bucketName}`}</h1>
        <CloseButton />
      </div>
    );
  };

  const Buttons = () => {
    return (
      <div className="flex justify-end p-4 space-x-4">
        <Button title="Clear" onClick={clear} />
        <Button
          title="Edit Bucket"
          disabled={!changed}
          onClick={updateBucket}
        />
      </div>
    );
  };

  return (
    <Modal open={bucketName !== undefined}>
      <div className="p-6">
        <Title />
        <BucketFeatures />
        <Buttons />
      </div>
    </Modal>
  );
};
