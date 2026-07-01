// SPDX-FileCopyrightText: 2025 Istituto Nazionale di Fisica Nucleare
//
// SPDX-License-Identifier: EUPL-1.2

"use client";

import { Button, ToggleSwitch } from "@/components/buttons";
import Form from "@/components/form";
import Modal, { ModalBody, ModalFooter } from "@/components/modal";
import Input from "@/components/inputs/input";
import { toaster } from "@/components/toaster";
import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createBucket } from "./actions";

function InvalidBucketError() {
  return (
    <div>
      <p className="mt-1 text-xs font-bold">
        Bucket name is not valid. It must:
      </p>
      <ul className="ml-3 list-disc text-xs">
        <li>be between 3 and 63 characters long</li>
        <li>
          consist only of lowercase letters, numbers,{" "}
          <span className="font-code">.</span> and{" "}
          <span className="font-code">-</span>
        </li>
        <li>begin and end with a letter or number</li>
        <li>not contain two adjacent periods</li>
        <li>
          not be formatted as an IP address (i.e,{" "}
          <span className="font-code">192.168.5.4</span>)
        </li>
        <li>
          not start with the prefix <span className="font-code">xn--</span>
        </li>
        <li>
          not end with the suffix <span className="font-code">-s3alias</span>
        </li>
        <li>
          not end with the suffix <span className="font-code">--ol-s3</span>.
        </li>
      </ul>
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
  const [newBucket, setNewBucket] = useState("");
  const [error, setError] = useState(false);
  const router = useRouter();
  const reset = () => {
    setNewBucket("");
    setError(false);
  };

  const closeAndReset = () => {
    reset();
    onClose();
  };

  const action = (formData: FormData) => {
    const submit = async () => {
      const error = await createBucket(formData);
      if (!error) {
        toaster.success("Bucket successfully created");
        router.refresh();
        closeAndReset();
      } else {
        toaster.danger("Cannot create bucket", error);
      }
    };
    submit();
  };

  const validateBucketName = useCallback(() => {
    const pattern = /(?!(^xn--|.+-s3alias$))^[a-z0-9][a-z0-9-.]{1,61}[a-z0-9]$/;
    const isValid = pattern.test(newBucket);
    setError(!isValid);
  }, [newBucket]);

  return (
    <Modal title="Create new bucket" show={show} onClose={closeAndReset}>
      <Form action={action}>
        <ModalBody>
          <div className="mt-16 flex items-start">
            <div className="font-bold lg:w-52">Bucket Name*</div>
            <div className="w-full">
              <Input
                name="new-bucket"
                placeholder="Enter a name for your bucket"
                onChange={e => setNewBucket(e.currentTarget.value)}
                onBlur={validateBucketName}
              />
              {newBucket && error && <InvalidBucketError />}
            </div>
          </div>
          <BucketFeatures />
        </ModalBody>
        <ModalFooter>
          <Button
            className="btn-tertiary"
            title="Clear"
            type="reset"
            onClick={reset}
          >
            Clear
          </Button>
          <Button
            className="btn-primary"
            title="Create Bucket"
            type="submit"
            disabled={!newBucket || error}
          >
            Create Bucket
          </Button>
        </ModalFooter>
      </Form>
    </Modal>
  );
}
