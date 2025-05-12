"use client";

import { Bucket } from "@aws-sdk/client-s3";
import { BucketConfiguration } from "@/models/bucket";
import { Button, ToggleSwitch } from "@/components/buttons";
import Modal, { ModalBody, ModalFooter } from "@/components/modal";
import { toaster } from "@/components/toaster";
import { parseS3Error } from "@/commons/utils";
import Form from "@/components/form";
import { useState } from "react";
import { setBucketObjectLock, setBucketVersioning } from "./actions";

export default function EditBucketModal(props: {
  bucket: Bucket;
  show: boolean;
  onClose: () => void;
  configuration: BucketConfiguration;
}) {
  const { bucket, show, onClose, configuration } = props;
  const [versioning, setVersioning] = useState(configuration.versioning);
  const [objectLock, setObjectLock] = useState(configuration.objectLock);

  const bucketName = bucket.Name;
  if (!bucketName) {
    console.error("unable to edit a bucket without name");
    return;
  }

  const editVersioning = async (event: React.FormEvent<HTMLInputElement>) => {
    const enabled = event.currentTarget.checked;
    const { error } = await setBucketVersioning(bucketName, enabled);
    if (error) {
      toaster.danger("Cannot update Versioning", parseS3Error(error));
    } else {
      toaster.success(`Versioning ${enabled ? "enabled" : "disabled"}`);
      setVersioning(enabled);
    }
  };

  const editObjectLock = async (event: React.FormEvent<HTMLInputElement>) => {
    const enabled = event.currentTarget.checked;
    const { error } = await setBucketObjectLock(bucketName, enabled);
    if (error) {
      toaster.danger("Cannot update Object Lock", error);
    } else {
      toaster.success(`Object Lock ${enabled} ? "enabled" : "disabled"`);
      setObjectLock(false);
    }
  };

  const BucketFeatures = () => {
    return (
      <div className="mt-4 space-y-2">
        <p className="font-bold">Features</p>
        <div className="flex justify-between">
          <p>Versioning</p>
          <ToggleSwitch checked={versioning} onChange={editVersioning} />
        </div>
        <div className="flex justify-between">
          <p>Object Lock</p>
          <ToggleSwitch checked={objectLock} onChange={editObjectLock} />
        </div>
      </div>
    );
  };

  return (
    <Modal title={`Edit bucket ${bucket.Name}`} show={show} onClose={onClose}>
      <Form>
        <ModalBody>
          <BucketFeatures />
        </ModalBody>
        <ModalFooter>
          <Button
            className="btn-tertiary"
            title="Close"
            type="button"
            onClick={onClose}
          >
            Close
          </Button>
        </ModalFooter>
      </Form>
    </Modal>
  );
}
