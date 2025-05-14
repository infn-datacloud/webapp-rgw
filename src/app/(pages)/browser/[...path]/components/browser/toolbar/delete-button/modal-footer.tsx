// SPDX-FileCopyrightText: 2025 Istituto Nazionale di Fisica Nucleare
//
// SPDX-License-Identifier: EUPL-1.2

import { Button } from "@/components/buttons";
import { LoadingBar } from "@/components/loading";
import { ModalFooter } from "@/components/modal";
import { TrashIcon } from "@heroicons/react/24/outline";

type DeleteModalFooterProps = {
  pending: boolean;
  onClick?: () => void;
  onClose?: () => void;
};

export function DeleteModalFooter(props: Readonly<DeleteModalFooterProps>) {
  const { pending, onClick, onClose } = props;
  return (
    <div className="flex w-full flex-col gap-2">
      <LoadingBar show={pending} />
      <ModalFooter>
        <Button type="reset" title="Cancel" onClick={onClose} />
        <Button
          className="btn-danger"
          title="Delete"
          color="danger"
          type="submit"
          onClick={onClick}
        >
          <TrashIcon className="size-5" />
          Delete
        </Button>
      </ModalFooter>
    </div>
  );
}
