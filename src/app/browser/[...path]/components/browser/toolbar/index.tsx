// SPDX-FileCopyrightText: 2025 Istituto Nazionale di Fisica Nucleare
//
// SPDX-License-Identifier: EUPL-1.2

"use client";

import HomeButton from "./home-button";
import UploadButton from "./upload-button";
import RefreshButton from "./refresh-button";
import NewPathButton from "./new-path-button";
import PathViewer from "./path-viewer";
import { SearchField } from "@/components/search-field";
import { useUploader } from "@/components/uploader";
import { FileObjectWithProgress } from "@/models/bucket";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

export default function Toolbar(
  props: Readonly<{
    bucket: string;
    currentPath: string;
    prefix?: string;
    onPathChange?: (newPath: string) => void;
  }>
) {
  const { bucket, prefix, currentPath, onPathChange } = props;
  const searchParams = useSearchParams();
  const router = useRouter();
  const { upload } = useUploader();

  const handleQueryChanged = (query: string) => {
    const searchParams = new URLSearchParams(window.location.search);
    if (query) {
      searchParams.set("q", query);
      searchParams.set("focus", "search-field");
    } else {
      searchParams.delete("q");
    }
    const url = `${window.location.pathname}?${searchParams.toString()}`;
    router.push(url);
  };

  useEffect(() => {
    if (searchParams.get("focus")) {
      document.getElementById("search-field")?.focus();
    }
  }, [searchParams]);

  function startUploads(files: File[]) {
    files.forEach(file => {
      const Key = `${prefix ?? ""}${file.name}`;
      const fo = new FileObjectWithProgress({ Key }, file);
      upload(fo, bucket);
    });
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-2">
        <HomeButton />
        <UploadButton onChange={startUploads} />
        <RefreshButton />
        <NewPathButton currentPath={currentPath} onPathChange={onPathChange} />
      </div>
      <div className="flex flex-wrap justify-between">
        <PathViewer currentPath={currentPath} />
        <SearchField
          defaultValue={searchParams.get("q") ?? undefined}
          onChange={handleQueryChanged}
        />
      </div>
    </div>
  );
}
