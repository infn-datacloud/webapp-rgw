// SPDX-FileCopyrightText: 2025 Istituto Nazionale di Fisica Nucleare
//
// SPDX-License-Identifier: EUPL-1.2

import Form from "@/components/form";
import Modal, { ModalBody } from "@/components/modal";
import { _Object, CommonPrefix } from "@aws-sdk/client-s3";
import { toaster } from "@/components/toaster";
import { parseS3Error } from "@/commons/utils";
import { useRouter } from "next/navigation";
import { DeleteModalFooter } from "./modal-footer";
import { deleteAll } from "./actions";
import { useState } from "react";

type ConfirmationModalProps = {
  show: boolean;
  bucket: string;
  objectsToDelete: _Object[];
  foldersToDelete: CommonPrefix[];
  onClose: () => void;
};

export function ConfirmationModal(props: Readonly<ConfirmationModalProps>) {
  const { show, onClose, bucket, objectsToDelete, foldersToDelete } = props;
  const [pending, setPending] = useState(false);
  const router = useRouter();

  const action = async () => {
    try {
      setPending(true);
      await deleteAll(bucket, objectsToDelete, foldersToDelete);
      toaster.success("Object(s) successfully deleted");
      onClose?.();
      router.refresh();
    } catch (err) {
      const error = parseS3Error(err);
      toaster.danger("Cannot delete object(s)", error);
    } finally {
      setPending(false);
    }
  };

  return (
    <Modal title="Delete File(s)" show={show} onClose={onClose}>
      <Form action={action} className="divide-y">
        <ModalBody>
          Are you sure you want to delete the following file(s)?
          <ul className="p-4 font-mono">
            {objectsToDelete.map(o => (
              <li className="list-disc" key={o.Key}>
                {o.Key}
              </li>
            ))}
            {foldersToDelete.map(f => (
              <li className="list-disc" key={f.Prefix}>{`${f.Prefix}**/*`}</li>
            ))}
          </ul>
        </ModalBody>
        <DeleteModalFooter
          pending={pending}
          onClick={() => setPending(true)}
          onClose={onClose}
        />
      </Form>
    </Modal>
  );
}
