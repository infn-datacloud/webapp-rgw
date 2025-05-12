import { Button } from "@/components/buttons";
import { LoadingBar } from "@/components/loading";
import { ModalFooter } from "@/components/modal";
import { TrashIcon } from "@heroicons/react/24/outline";
import { useFormStatus } from "react-dom";

type DeleteModalFooterProps = {
  onClose?: () => void;
};

export function DeleteModalFooter(props: Readonly<DeleteModalFooterProps>) {
  const { onClose } = props;
  const { pending } = useFormStatus();
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
        >
          <TrashIcon className="size-5" />
          Delete
        </Button>
      </ModalFooter>
    </div>
  );
}
