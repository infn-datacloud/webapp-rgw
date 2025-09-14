// SPDX-FileCopyrightText: 2025 Istituto Nazionale di Fisica Nucleare
//
// SPDX-License-Identifier: EUPL-1.2

import Modal, { ModalBody, ModalFooter, ModalProps } from "@/components/modal";
import { Button } from "@headlessui/react";

interface ConfirmationModalProps extends ModalProps {
  abortAll?: () => void;
}

export function ConfirmationModal(props: Readonly<ConfirmationModalProps>) {
  const { abortAll, ...others } = props;
  const handleAbort = () => {
    abortAll?.();
    props.onClose();
  };
  return (
    <Modal title="Abort all uploads" {...others}>
      <ModalBody>
        <div className="flex justify-center">
          <p className="p-6">
            Are you sure to abort all currently active uploads?
          </p>
        </div>
      </ModalBody>
      <ModalFooter>
        <Button className="btn-tertiary" onClick={props.onClose}>
          Cancel
        </Button>
        <Button className="btn-danger" onClick={handleAbort}>
          Abort
        </Button>
      </ModalFooter>
    </Modal>
  );
}
