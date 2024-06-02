import { useState, useEffect, ChangeEvent, useRef } from "react";
import { CheckIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { Button } from "@/components/Button";
import Modal, { ModalBody, ModalFooter } from "@/components/Modal";
import { addKeyHandler } from "@/commons/utils";
import Input from "@/components/Input";
import Form from "@/components/Form";
import { useRouter } from "next/navigation";

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

function CurrentPath({ path }: { path: string }) {
  return (
    <div className="flex">
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
    <div className="mt-8 flex space-x-8 content-center">
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
};

export const NewPathModal = (props: ModalProps) => {
  const { prefix, currentPath, onPathChange } = props;
  const [path, setPath] = useState<string>("");
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();

  useEffect(() => {
    const cleanupKeyHandler = addKeyHandler("Enter", () => {
      formRef.current?.requestSubmit();
    });
    return () => {
      cleanupKeyHandler();
    };
  });

  const clear = () => {
    formRef.current?.reset();
    setPath("");
  };

  const handleSubmit = (formData: FormData) => {
    const newPath = formData.get("new-path")?.toString();
    if (newPath) {
      const path = currentPath ? `${currentPath}/${newPath}` : newPath;
      onPathChange?.(path);
      clear();
      router.back();
    } else {
      console.warn("New path is undefined");
    }
  };

  const pathIsValid = path.length > 0;

  return (
    <Modal title="Choose or create a new path" id="create-path">
      <Form ref={formRef} action={handleSubmit}>
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
