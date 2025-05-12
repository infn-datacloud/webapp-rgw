import { Button } from "@/components/buttons";
import Modal, { ModalBody, ModalFooter, ModalProps } from "@/components/modal";
import { Bucket } from "@aws-sdk/client-s3";
import { deleteBucket } from "./actions";
import { toaster } from "@/components/toaster";

interface ConfirmationModalProps extends ModalProps {
  bucket: Bucket;
}

export function ConfirmationModal(props: Readonly<ConfirmationModalProps>) {
  const { bucket, ...modalProps } = props;
  const bucketName = bucket.Name;
  if (!bucketName) {
    console.error("cannot delete bucket without name");
    return;
  }

  const action = async () => {
    const error = await deleteBucket(bucketName);
    if (!error) {
      toaster.success("Bucket successfully deleted");
    } else {
      toaster.danger("Cannot delete bucket", error);
    }
    modalProps.onClose?.();
  };

  return (
    <Modal title="Delete bucket" {...modalProps}>
      <ModalBody>
        Are you sure you want to delete the bucket <strong>{bucketName}</strong>
        ?
      </ModalBody>
      <ModalFooter>
        <Button
          className="btn-tertiary"
          type="button"
          onClick={modalProps.onClose}
        >
          Cancel
        </Button>
        <Button className="btn-danger" type="button" onClick={action}>
          Delete bucket
        </Button>
      </ModalFooter>
    </Modal>
  );
}
