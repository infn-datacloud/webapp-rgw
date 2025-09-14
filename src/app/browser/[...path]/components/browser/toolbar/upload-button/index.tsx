// SPDX-FileCopyrightText: 2025 Istituto Nazionale di Fisica Nucleare
//
// SPDX-License-Identifier: EUPL-1.2

import { InputFile } from "@/components/inputs";
import { ChangeEvent } from "react";

type UploadButtonProps = {
  onChange: (files: File[]) => void;
};

export default function UploadButton(props: Readonly<UploadButtonProps>) {
  const { onChange } = props;

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) {
      return;
    }
    onChange(Array.from(e.target.files));
  };

  return <InputFile onChange={handleChange} />;
}
