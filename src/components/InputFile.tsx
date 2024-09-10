import { ChangeEvent, ReactNode } from "react";
import { Button } from "./Button";

interface InputFileProps {
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  icon?: ReactNode;
}

export const InputFile = ({ onChange, icon }: InputFileProps) => {
  const openFileSelector = async () => {
    const fileSelector = document.getElementById("file-selector");
    if (fileSelector) {
      fileSelector.click();
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange(e);
    // reset the <input> value to allow subsequent uploads of the same file
    e.target.value = "";
  };

  return (
    <div className="">
      <input
        onChange={handleChange}
        className="hidden"
        type="file"
        id="file-selector"
        multiple={true}
      />
      <Button
        title="Upload File"
        icon={icon}
        color="primary-outline"
        onClick={openFileSelector}
      />
    </div>
  );
};
