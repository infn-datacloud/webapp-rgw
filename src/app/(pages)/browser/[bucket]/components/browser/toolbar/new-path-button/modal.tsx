import { useState, ChangeEvent } from "react";
import { CheckIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { Button } from "@/components/buttons";
import Modal, { ModalBody, ModalFooter } from "@/components/modal";
import Input from "@/components/inputs/input";
import Form from "@/components/form";

function ClearButton() {
  return <Button title="Clear" icon={<XMarkIcon />} type="reset" />;
}

function SubmitButton({ canSubmit }: { canSubmit: boolean }) {
  return <Button title="Confirm" icon={<CheckIcon />} disabled={!canSubmit} />;
}

function CurrentPath({ path }: { path: string }) {
  return (
    <div className="flex mt-2">
      <p className="font-semibold mr-2">Current Path: </p>
      {path}
    </div>
  );
}

function NewPathTextField({ onChange }: { onChange: (value: string) => void }) {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value);
  };
  return (
    <div className="mt-6 flex space-x-8 content-center">
      <div className="lg:w-52 my-auto">New Folder Path</div>
      <Input
        name="new-path"
        placeholder={"Enter the new Folder Path"}
        onChange={handleChange}
      />
    </div>
  );
}

type ModalProps = {
  prefix?: string;
  currentPath: string;
  onPathChange?: (newPath: string) => void;
  show: boolean;
  onClose: () => void;
};

export const NewPathModal = (props: ModalProps) => {
  const { prefix, currentPath, onPathChange, show, onClose } = props;
  const [path, setPath] = useState<string>("");

  const clear = () => {
    setPath("");
  };

  const handleSubmit = (formData: FormData) => {
    const newPath = formData.get("new-path")?.toString();
    if (newPath) {
      const path = currentPath ? `${currentPath}/${newPath}` : newPath;
      onPathChange?.(path);
      clear();
      onClose();
    } else {
      console.warn("New path is undefined");
    }
  };

  const pathIsValid = path.length > 0;

  return (
    <Modal title="Choose or create a new path" show={show} onClose={onClose}>
      <Form action={handleSubmit} className="divide-y">
        <ModalBody>
          <CurrentPath path={`${prefix}/${currentPath}`} />
          <NewPathTextField onChange={setPath} />
        </ModalBody>
        <ModalFooter>
          <ClearButton />
          <SubmitButton canSubmit={pathIsValid} />
        </ModalFooter>
      </Form>
    </Modal>
  );
};
