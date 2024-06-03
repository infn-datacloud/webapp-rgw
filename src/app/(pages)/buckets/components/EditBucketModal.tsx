"use client";
import { useNotifications, NotificationType } from "@/services/notifications";
import { useEffect, useState, useRef } from "react";
import ToggleSwitch from "@/components/ToggleSwitch";
import { useRouter, useSearchParams } from "next/navigation";
import { getBucketConfiguration, setBucketConfiguration } from "../actions";
import { BucketConfiguration } from "@/models/bucket";
import { Button } from "@/components/Button";
import Modal, { ModalBody, ModalFooter } from "@/components/Modal";
import Form from "@/components/Form";

export default function EditBucketModal() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const bucket = searchParams.get("bucket");
  const { notify } = useNotifications();
  const bucketRef = useRef<string>();

  const [defaultValues, setDefaultValues] = useState<BucketConfiguration>({
    versioning: false,
    objectLock: false,
  });

  useEffect(() => {
    const fetchInitialConfiguration = async () => {
      if (!bucket) {
        return;
      }
      bucketRef.current = bucket;
      const config = await getBucketConfiguration(bucket);
      setDefaultValues(config);
    };
    fetchInitialConfiguration();
  }, [bucket]);

  const BucketFeatures = () => {
    return (
      <div className="mt-4 space-y-2">
        <p className="font-bold">Features</p>
        <div className="flex justify-between">
          <p>Versioning</p>
          <ToggleSwitch
            name="versioning-switch"
            defaultChecked={defaultValues.versioning}
          />
        </div>
        <div className="flex justify-between">
          <p>Object Lock</p>
          <ToggleSwitch
            name="objectlock-switch"
            defaultChecked={defaultValues.objectLock}
          />
        </div>
      </div>
    );
  };

  const handleSubmit = (formData: FormData) => {
    const submit = async () => {
      if (!bucket) {
        console.warn("bucket is null");
        return;
      }
      try {
        const versioning = formData.get("versioning-switch") === "on";
        const objectLock = formData.get("objectlock-switch") === "on";
        await setBucketConfiguration(bucket, { versioning, objectLock });
        router.back();
        notify("Bucket successfully edited", "", NotificationType.success);
      } catch (err) {
        err instanceof Error
          ? notify("Cannot edit bucket", err.name, NotificationType.error)
          : console.error(err);
      }
    };
    submit();
  };

  return (
    <Modal title={`Edit Bucket ${bucketRef.current ?? ""}`} id="edit-bucket">
      <Form action={handleSubmit}>
        <ModalBody>
          <BucketFeatures />
        </ModalBody>
        <ModalFooter>
          <Button title="Clear" type="reset" />
          <Button title="Edit Bucket" type="submit" />
        </ModalFooter>
      </Form>
    </Modal>
  );
}
