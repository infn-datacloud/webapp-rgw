"use client";

import HomeButton from "./home-button";
import UploadButton from "./upload-button";
import RefreshButton from "./refresh-button";
import NewPathButton from "./new-path-button";
import PathViewer from "./path-viewer";
import { SearchField } from "@/components/search-field";
import { useRouter, useSearchParams } from "next/navigation";
import { _Object } from "@aws-sdk/client-s3";
import { useEffect } from "react";

export default function Toolbar(
  props: Readonly<{
    bucket: string;
    currentPath: string;
    prefix?: string;
    onPathChange?: (newPath: string) => void;
  }>
) {
  const { bucket, currentPath, prefix, onPathChange } = props;

  const searchParams = useSearchParams();
  const router = useRouter();

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

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col sm:flex-row">
        <div className="flex grow flex-row gap-2 py-1">
          <HomeButton />
          <UploadButton bucket={bucket} prefix={prefix} />
          <RefreshButton />
        </div>
        <div className="flex flex-row gap-2 py-1 sm:flex-col">
          <NewPathButton
            currentPath={currentPath}
            onPathChange={onPathChange}
          />
        </div>
      </div>
      <div className="flex w-full flex-col sm:flex-row sm:items-center">
        <div className="grow flex-row sm:flex-col">
          <PathViewer currentPath={currentPath} />
        </div>
        <div className="flex flex-row justify-end sm:flex-col">
          <SearchField
            defaultValue={searchParams.get("q") ?? undefined}
            onChange={handleQueryChanged}
          />
        </div>
      </div>
    </div>
  );
}
