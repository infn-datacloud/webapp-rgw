// SPDX-FileCopyrightText: 2025 Istituto Nazionale di Fisica Nucleare
//
// SPDX-License-Identifier: EUPL-1.2

"use client";

import { toaster } from "@/components/toaster";
import { FileObjectWithProgress } from "@/models/bucket";
import { useS3 } from "@/services/s3/useS3";
import { useRouter } from "next/navigation";
import { ProgressPopup } from "./progress-popup";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
} from "react";
import reducer, { defaultState } from "./reducer";

export interface UploaderContextProps {
  upload: (files: File[], bucket: string, prefix: string) => void;
  onComplete?: () => void;
  children?: React.ReactNode;
}

export const UploaderContext = createContext<UploaderContextProps | undefined>(
  undefined
);

export default function UploaderProvider(
  props: Readonly<{
    onComplete?: () => void;
    children?: React.ReactElement;
  }>
) {
  const { onComplete, children } = props;
  const [state, dispatch] = useReducer(reducer, defaultState);
  const [filesToUpload, setFilesToUpload] = useState<{
    files: File[];
    bucket: string;
    prefix: string;
  }>();
  const router = useRouter();
  const s3 = useS3();

  function handleUploadsUpdates(object: FileObjectWithProgress) {
    dispatch({ type: "ON_UPDATE", object });
  }

  const handleUploadComplete = useCallback(() => {
    dispatch({ type: "ON_COMPLETE" });
    router.refresh();
  }, [router]);

  const uploadFiles = useCallback(
    async (data: { files: File[]; bucket: string; prefix: string }) => {
      if (!s3) {
        return;
      }
      const { files, bucket, prefix } = data;
      const toUpload = files?.map(file => {
        const Key = `${prefix ?? ""}${file.name}`;
        return new FileObjectWithProgress({ Key }, file);
      });
      try {
        const promises = toUpload
          .filter(f => f.state() === "pending")
          .map(file => {
            state.progressStates.set(file.id, file);
            const onUpdate = () => handleUploadsUpdates(file);
            const onComplete = () => handleUploadComplete();
            return s3.uploadObject(bucket, file, onUpdate, onComplete);
          });
        dispatch({ type: "START_UPLOADS", objects: toUpload });
        await Promise.allSettled(promises);
      } catch (err) {
        let message = "Unknown Error";
        if (err instanceof Error && err.message === "AccessDenied") {
          message = "Access Denied";
        }
        toaster.danger("Cannot upload file(s)", message);
      }
    },
    [s3, handleUploadComplete, state.progressStates]
  );

  useEffect(() => {
    if (filesToUpload && filesToUpload.files.length > 0) {
      uploadFiles(filesToUpload);
      setFilesToUpload(undefined);
    }
  }, [s3, filesToUpload, uploadFiles]);

  async function upload(files: File[], bucket: string, prefix: string) {
    setFilesToUpload({ files, bucket, prefix });
  }

  useEffect(() => {
    if (state.allComplete) {
      toaster.info("Uploading complete");
      onComplete?.();
    }
  }, [state.allComplete, onComplete]);

  function closeUploader() {
    dispatch({ type: "CLOSE" });
  }

  function abort(file: FileObjectWithProgress) {
    dispatch({ type: "ABORT", object: file });
    toaster.danger("Upload aborted", file.object.Key);
  }

  function abortAllUploads() {
    dispatch({ type: "ABORT_ALL" });
  }

  const progresses = useMemo(() => {
    return [...state.progressStates.values()];
  }, [state.progressStates]);

  const value = useMemo(
    () => ({
      upload,
    }),
    []
  );

  return (
    <UploaderContext.Provider value={value}>
      <>
        {children}
        <ProgressPopup
          title="Uploading"
          show={state.show}
          onClose={closeUploader}
          progressList={progresses}
          allCompleted={state.allComplete}
          onAbort={abort}
          onAbortAll={abortAllUploads}
        />
      </>
    </UploaderContext.Provider>
  );
}

export const useUploader = (): UploaderContextProps => {
  const context = useContext(UploaderContext);
  if (!context) {
    throw new Error(
      "Uploader is undefined, " +
        "please verify you are calling useUploader " +
        "as a child of UploaderContext component."
    );
  }
  return context;
};
