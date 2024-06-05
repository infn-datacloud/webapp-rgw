"use client";
import { createBucket } from "../actions";
import Modal, { ModalBody, ModalFooter } from "@/components/Modal";
import Form from "@/components/Form";
import ToggleSwitch from "@/components/ToggleSwitch";
import Input from "@/components/Input";
import { useState } from "react";
import { Button } from "@/components/Button";
import { useRouter } from "next/navigation";
import { toaster } from "@/components/toaster";

const bucketValidator = new RegExp(
  "(?!(^xn--|.+-s3alias$))^[a-z0-9][a-z0-9-.]{1,61}[a-z0-9]$"
);
const InvalidBucketError = () => {
  return (
    <>
      <p className="text-xs font-bold mt-1">Bucket name is not valid.</p>
      <p className="text-xs">Bucket name must:</p>
      <ul className="list-disc text-xs ml-3">
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
    <div className="flex justify-between mt-16">
      <div className="lg:w-52 my-auto">Bucket Name*</div>
      <Input
        name="new-bucket"
        className="w-2/3 px-4"
        placeholder={"Enter a name for your bucket"}
        value={newBucket}
        onChange={e => setNewBucket(e.currentTarget.value)}
        onBlur={() => validateBucketName()}
      />
      {/* {error ? <InvalidBucketError /> : null} */}
    </div>
  );
}

export default function CreateBucketModal() {
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
        router.back();
      } else {
        toaster.danger("Cannot not create bucket", error.message);
      }
    };
    submit();
  };

  return (
    <Modal title="Create new bucket" id={"create-bucket"}>
      <Form action={action}>
        <ModalBody>
          <NewBucketNameInput />
          <BucketFeatures />
        </ModalBody>
        <ModalFooter>
          <Button title="Clear" type="reset" />
          <Button title="Create Bucket" type="submit" />
        </ModalFooter>
      </Form>
    </Modal>
  );
}
