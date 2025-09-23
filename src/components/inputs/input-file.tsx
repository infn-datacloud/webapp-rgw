// SPDX-FileCopyrightText: 2025 Istituto Nazionale di Fisica Nucleare
//
// SPDX-License-Identifier: EUPL-1.2

import { ArrowUpOnSquareIcon } from "@heroicons/react/24/outline";
import { Button } from "@/components/buttons";
import { ChangeEvent } from "react";

interface InputFileProps {
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

export default function InputFile(props: Readonly<InputFileProps>) {
  const { onChange } = props;
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
    <div>
      <input
        onChange={handleChange}
        className="hidden"
        type="file"
        id="file-selector"
        multiple={true}
      />
      <Button
        className="btn-secondary items-center"
        title="Upload File"
        onClick={openFileSelector}
      >
        <ArrowUpOnSquareIcon className="size-5" />
        Upload File
      </Button>
    </div>
  );
}
