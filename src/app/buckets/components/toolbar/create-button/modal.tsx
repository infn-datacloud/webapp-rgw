// SPDX-FileCopyrightText: 2025 Istituto Nazionale di Fisica Nucleare
//
// SPDX-License-Identifier: EUPL-1.2

"use client";

import { Button, ToggleSwitch } from "@/components/buttons";
import Form from "@/components/form";
import Modal, { ModalBody, ModalFooter } from "@/components/modal";
import Input from "@/components/inputs/input";
import { toaster } from "@/components/toaster";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createBucket } from "./actions";

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

function BucketFeatures() {
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
}

type CreateBucketModal = {
  show: boolean;
  onClose: () => void;
};

export default function CreateBucketModal(props: Readonly<CreateBucketModal>) {
  const { show, onClose } = props;
  const router = useRouter();

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
