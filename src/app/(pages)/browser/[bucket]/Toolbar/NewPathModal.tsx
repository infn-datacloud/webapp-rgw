import { useState, useEffect, ChangeEvent, useRef } from "react";
import { CheckIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { Button } from "@/components/Button";
import { Modal } from "@/components/Modal";
import { addKeyHandler } from "@/commons/utils";
import Input from "@/components/Input";
import Form from "@/components/Form";

function CloseButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      className="w-8 p-[5px] text-neutral-500 hover:bg-neutral-200 rounded-full"
      onClick={onClick}
    >
      <XMarkIcon />
    </button>
  );
}

function ClearButton() {
  return <Button title="Clear" icon={<XMarkIcon />} type="reset" />;
}

function SubmitButton({ canSubmit }: { canSubmit: boolean }) {
  return (
    <Button
      title="Confirm"
      icon={<CheckIcon />}
      disabled={!canSubmit}
      type="submit"
    />
  );
}

function Header({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex place-content-between">
      <h1 className="text-2xl font-semibold">Choose or create a new path</h1>
      <CloseButton onClick={onClose} />
    </div>
  );
}

function CurrentPath({ path }: { path: string }) {
  return (
    <div className="flex mt-8">
      <h2 className="font-semibold mr-2">Current Path: </h2>
      {path}
    </div>
  );
}

function NewPathTextField({ onChange }: { onChange: (value: string) => void }) {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value);
  };
  return (
    <div className="mt-16 flex space-x-8 content-center">
      <div className="lg:w-52 my-auto">New Folder Path</div>
      <Input
        name="new-path"
        placeholder={"Enter the new Folder Path"}
        onChange={handleChange}
      />
    </div>
  );
}

function Footer({ canSubmit }: { canSubmit: boolean }) {
  return (
    <div className="flex place-content-between mt-16">
      <div className="flex space-x-4">
        <ClearButton />
        <SubmitButton canSubmit={canSubmit} />
      </div>
    </div>
  );
}

type ModalProps = {
  open: boolean;
  prefix?: string;
  currentPath: string;
  onClose: () => void;
  onPathChange?: (newPath: string) => void;
};

export const NewPathModal = (props: ModalProps) => {
  const { open, prefix, currentPath, onClose, onPathChange } = props;
  const [path, setPath] = useState<string>("");
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }
    const cleanupKeyHandler = addKeyHandler("Enter", () => {
      formRef.current?.requestSubmit();
    });
    return () => {
      cleanupKeyHandler();
      setPath("");
    };
  }, [open]);

  const handleSubmit = (formData: FormData) => {
    const newPath = formData.get("new-path")?.toString();
    if (newPath) {
      const path = currentPath ? `${currentPath}/${newPath}` : newPath;
      onPathChange?.(path);
    } else {
      console.warn("New path is undefined");
    }
    onClose();
  };

  const pathIsValid = path.length > 0;

  return (
    <Modal open={open}>
      <Form ref={formRef} action={handleSubmit} className="p-6">
        <Header onClose={onClose} />
        <CurrentPath path={`${prefix}/${currentPath}`} />
        <NewPathTextField onChange={setPath} />
        <Footer canSubmit={pathIsValid} />
      </Form>
    </Modal>
  );
};
