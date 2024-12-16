"use client";
import { setBucketConfiguration } from "./actions";
import { BucketConfiguration } from "@/models/bucket";
import { Button, ToggleSwitch } from "@/components/buttons";
import Modal, { ModalBody, ModalFooter } from "@/components/modal";
import Form from "@/components/form";
import { toaster } from "@/components/toaster";
import { useRouter } from "next/navigation";

export default function EditBucketModal(props: {
  bucket: string;
  show: boolean;
  onClose: () => void;
  configuration: BucketConfiguration;
}) {
  const { bucket, show, onClose, configuration } = props;
  const router = useRouter();

  const BucketFeatures = () => {
    return (
      <div className="mt-4 space-y-2">
        <p className="font-bold">Features</p>
        <div className="flex justify-between">
          <p>Versioning</p>
          <ToggleSwitch
            name="versioning-switch"
            defaultChecked={configuration.versioning}
          />
        </div>
        <div className="flex justify-between">
          <p>Object Lock</p>
          <ToggleSwitch
            name="objectlock-switch"
            defaultChecked={configuration.objectLock}
          />
        </div>
      </div>
    );
  };

  const handleSubmit = (formData: FormData) => {
    const submit = async () => {
      const versioning = formData.get("versioning-switch") === "on";
      const objectLock = formData.get("objectlock-switch") === "on";
      const error = await setBucketConfiguration(bucket, {
        versioning,
        objectLock,
      });
      if (!error) {
        toaster.success("Bucket successfully edited");
        onClose();
        router.refresh();
      } else {
        toaster.danger("Cannot edit bucket", error.message);
      }
    };
    submit();
  };
  return (
    <Modal title={`Edit bucket ${bucket}`} show={show} onClose={onClose}>
      <Form action={handleSubmit} className="divide-y">
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
