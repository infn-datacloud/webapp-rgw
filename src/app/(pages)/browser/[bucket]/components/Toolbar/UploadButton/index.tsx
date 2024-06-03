import { InputFile } from "@/components/InputFile";
import { FileObjectWithProgress } from "@/models/bucket";
import { ArrowUpOnSquareIcon } from "@heroicons/react/24/outline";
import { useSession } from "next-auth/react";
import { S3Service } from "@/services/s3";
import { ChangeEvent, useEffect, useReducer, useRef } from "react";
import { camelToWords } from "@/commons/utils";
import { s3ClientConfig } from "@/services/s3/actions";
import { useNotifications } from "@/services/notifications/useNotifications";
import { NotificationType } from "@/services/notifications/types";
import { ProgressPopup } from "@/components/ProgressPopup";
import reducer, { defaultState } from "./reducer";

export default function UploadButton(props: {
  bucket: string;
  currentPath: string;
}) {
  const { bucket, currentPath } = props;
  const { status, data } = useSession();
  const { notify } = useNotifications();
  const [state, dispatch] = useReducer(reducer, defaultState);
  const s3Ref = useRef<S3Service | null>(null);
  const notifyRef = useRef(notify);

  useEffect(() => {
    if (status === "authenticated") {
      if (!data || !data.credentials) {
        throw new Error("Session not found");
      }
      s3ClientConfig(data.credentials).then(config => {
        s3Ref.current = new S3Service(config);
      });
    }
  }, [status, data]);

  function handleUploadsUpdates(object: FileObjectWithProgress) {
    dispatch({ type: "ON_UPDATE", object });
  }

  const handleUploadComplete = () => {
    dispatch({ type: "ON_COMPLETE" });
  };

  useEffect(() => {
    if (state.allComplete) {
      notify(
        "Upload Complete",
        "All files have been successfully uploaded",
        NotificationType.success
      );
    }
  }, [state.allComplete]);

  const uploadFiles = (files: FileObjectWithProgress[]) => {
    const s3 = s3Ref.current;
    if (!s3) {
      throw new Error("Cannot initialize S3 service");
    }
    try {
      const promises = files.map(file => {
        state.progressStates.set(file.id, file);
        const onUpdate = () => handleUploadsUpdates(file);
        const onComplete = () => handleUploadComplete();
        s3.uploadObject(bucket, file, onUpdate, onComplete);
      });

      Promise.all(promises).then(() => {
        console.debug("all settled");
        dispatch({ type: "START_UPLOADS", objects: files });
      });
    } catch (e) {
      const msg = e instanceof Error ? camelToWords(e.name) : "Unknown Error";
      notify("Cannot upload file(s)", msg, NotificationType.error);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) {
      return;
    }
    const { files } = e.target;
    const filesToUpload = new Array(files.length);
    for (let i = 0; i < files.length; ++i) {
      // avoid trailing slash if root is empty or "/"
      const Key =
        currentPath.length > 1
          ? `${currentPath}/${files[i].name}`
          : files[i].name;
      filesToUpload[i] = new FileObjectWithProgress({ Key }, files[i]);
    }
    uploadFiles(filesToUpload);
  };

  return (
    <>
      <InputFile icon={<ArrowUpOnSquareIcon />} onChange={handleChange} />
      <ProgressPopup
        title="Uploading"
        show={state.showPopup}
        progressList={[...state.progressStates.values()].map(o => {
          const t = o.object.Key!.split("/");
          return { title: t[t.length - 1], value: o.progress, id: o.id };
        })}
      />
    </>
  );
}
