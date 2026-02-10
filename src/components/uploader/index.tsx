// SPDX-FileCopyrightText: 2025 Istituto Nazionale di Fisica Nucleare
//
// SPDX-License-Identifier: EUPL-1.2

"use client";

import { toaster } from "@/components/toaster";
import { getS3ServiceConfig } from "@/services/s3/actions";
import { S3Service } from "@/services/s3";
import { FileObjectWithProgress } from "@/models/bucket";
import { useRouter } from "next/navigation";
import { ProgressPopup } from "./progress-popup";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
} from "react";
import reducer, { defaultState } from "./reducer";

export interface UploaderContextProps {
  upload: (
    file: FileObjectWithProgress,
    bucket: string,
  ) => void;
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
  const router = useRouter();
  const allCompleted = useMemo(
    () => state.inProgress.size === 0,
    [state.inProgress]
  );

  function handleUploadsUpdates(fileObject: FileObjectWithProgress) {
    dispatch({ type: "ON_UPDATE", fileObject });
  }

  const handleUploadComplete = useCallback(
    (fileObject: FileObjectWithProgress) => {
      dispatch({ type: "ON_COMPLETE", fileObject });
      router.refresh();
    },
    [router]
  );

  async function upload(fileObject: FileObjectWithProgress, bucket: string) {
    if (!state.inProgress.has(fileObject.id)) {
      const config = await getS3ServiceConfig();
      const s3 = new S3Service(config);
      const onUpdate = () => handleUploadsUpdates(fileObject);
      const onComplete = () => handleUploadComplete(fileObject);
      dispatch({ type: "START_UPLOAD", fileObject });
      s3.uploadObject(bucket, fileObject, onUpdate, onComplete);
    }
  }

  useEffect(() => {
    if (allCompleted) {
      toaster.info("Uploading complete");
      onComplete?.();
    }
  }, [allCompleted, onComplete]);

  function closeUploader() {
    dispatch({ type: "CLOSE" });
  }

  function abort(fileObject: FileObjectWithProgress) {
    dispatch({ type: "ABORT", fileObject });
    toaster.danger("Upload aborted", fileObject.object.Key);
  }

  function abortAllUploads() {
    dispatch({ type: "ABORT_ALL" });
  }

  const progresses = useMemo(() => {
    return [...state.inProgress.values(), ...state.completed.values()];
  }, [state]);

  return (
    <UploaderContext.Provider value={{ upload }}>
      <>
        {children}
        <ProgressPopup
          title="Uploading"
          show={state.show}
          onClose={closeUploader}
          progressList={progresses}
          allCompleted={allCompleted}
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
