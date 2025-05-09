"use client";
import { createBucket } from "./actions";
import Modal, { ModalBody, ModalFooter } from "@/components/modal";
import Form from "@/components/form";
import Input from "@/components/inputs/input";
import { useState } from "react";
import { Button, ToggleSwitch } from "@/components/buttons";
import { useRouter } from "next/navigation";
import { toaster } from "@/components/toaster";

const bucketValidator = new RegExp(
  "(?!(^xn--|.+-s3alias$))^[a-z0-9][a-z0-9-.]{1,61}[a-z0-9]$"
);
const InvalidBucketError = () => {
  return (
    <>
      <p className="mt-1 text-xs font-bold">Bucket name is not valid.</p>
      <p className="text-xs">Bucket name must:</p>
      <ul className="ml-3 list-disc text-xs">
        <li>be between 3(min) and 63(max) characters long.</li>
        <li>
          consist only of lowercase letters, numbers, dots(.), and hyphens(-).
        </li>
        <li>begin and end with a letter or number.</li>
        <li>not contain two adjacent periods.</li>
        <li>not be formatted as an IP address(for example, 192.168.5.4).</li>
        <li>not start with the prefix xn--.</li>
        <li>not end with the suffix - s3alias.</li>
        <li>not end with the suffix--ol - s3.</li>
      </ul>
    </>
  );
};

function NewBucketNameInput() {
  const [newBucket, setNewBucket] = useState("");
  const [error, setError] = useState(false);

  const validateBucketName = () => {
    setError(bucketValidator.test(newBucket));
  };

  return (
    <div className="mt-16 flex justify-between">
      <div className="my-auto font-bold lg:w-52">Bucket Name*</div>
      <div className="w-full">
        <Input
          name="new-bucket"
          placeholder={"Enter a name for your bucket"}
          value={newBucket}
          onChange={e => setNewBucket(e.currentTarget.value)}
          onBlur={() => validateBucketName()}
        />
      </div>
      {/* {error ? <InvalidBucketError /> : null} */}
    </div>
  );
}

export default function CreateBucketModal(props: {
  show: boolean;
  onClose: () => void;
}) {
  const { show, onClose } = props;
  const router = useRouter();
  const BucketFeatures = () => {
    return (
      <div className="mt-4 space-y-2">
        <p className="font-bold">Features</p>
        <div className="flex justify-between">
          <p>Versioning</p>
          <ToggleSwitch name="versioning-switch" />
        </div>
        <div className="flex justify-between">
          <p>Object Lock</p>
          <ToggleSwitch name="objectlock-switch" />
        </div>
      </div>
    );
  };

  const action = (formData: FormData) => {
    const submit = async () => {
      const error = await createBucket(formData);
      if (!error) {
        toaster.success("Bucket successfully created");
        router.refresh();
        onClose();
      } else {
        toaster.danger("Cannot create bucket", error);
      }
    };
    submit();
  };

  return (
    <Modal title="Create new bucket" show={show} onClose={onClose}>
      <Form action={action}>
        <ModalBody>
          <NewBucketNameInput />
          <BucketFeatures />
        </ModalBody>
        <ModalFooter>
          <Button className="btn-tertiary" title="Clear" type="reset">
            Clear
          </Button>
          <Button className="btn-primary" title="Create Bucket" type="submit">
            Create Bucket
          </Button>
        </ModalFooter>
      </Form>
    </Modal>
  );
}
