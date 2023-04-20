import { ChangeEvent } from "react";

interface InputFileProps {
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

export const InputFile = ({ onChange }: InputFileProps) => {
  return (
    <div className="">
      <input
        onChange={onChange}
        className="p-4 min-w-0 flex-auto rounded border \
        hover:bg-neutral-200 \
        file:rounded-none file:border-0 file:border-solid \
        file:bg-neutral-200"
        type="file"
      />
    </div>
  );
}