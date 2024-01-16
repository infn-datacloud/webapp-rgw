import { ChangeEvent, ReactNode } from "react";
import { Button } from "./Button";

interface InputFileProps {
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  icon?: ReactNode;
}

export const InputFile = ({ onChange, icon }: InputFileProps) => {
  const openFileSelector = () => {
    const fileSelector = document.getElementById("fileSelector");
    if (fileSelector) {
      fileSelector.click();
    }
  };

  return (
    <div className="">
      <input
        onChange={onChange}
        className="hidden"
        type="file"
        id="fileSelector"
        multiple={true}
      />
      <Button title="Upload File" icon={icon} onClick={openFileSelector} />
    </div>
  );
};
