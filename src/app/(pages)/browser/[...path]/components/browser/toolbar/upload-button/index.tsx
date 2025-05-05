import { InputFile } from "@/components/inputs";
import { FileObjectWithProgress } from "@/models/bucket";
import { ArrowUpOnSquareIcon } from "@heroicons/react/24/outline";
import { useSession } from "next-auth/react";
import { S3Service } from "@/services/s3";
import { ChangeEvent, useEffect, useReducer, useRef } from "react";
import { s3ClientConfig } from "@/services/s3/actions";
import { ProgressPopup } from "@/components/progress";
import reducer, { defaultState } from "./reducer";
import { useRouter } from "next/navigation";
import { toaster } from "@/components/toaster";

export default function UploadButton(
  props: Readonly<{
    bucket: string;
    prefix?: string;
  }>
) {
  const { bucket, prefix } = props;
  const { status, data } = useSession();
  const router = useRouter();
  const [state, dispatch] = useReducer(reducer, defaultState);
  const s3Ref = useRef<S3Service | null>(null);

  useEffect(() => {
    if (status === "authenticated") {
      if (!data?.credentials) {
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
      toaster.success("All files have been successfully uploaded");
      router.refresh();
    }
  }, [state.allComplete, router]);

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
        dispatch({ type: "START_UPLOADS", objects: files });
      });
    } catch (err) {
      console.error(err);
      let message = "Unknown Error";
      if (err instanceof Error) {
        switch (err.message) {
          case "AccessDenied":
            message = "Access Denied";
          default:
        }
      }
      toaster.danger("Cannot upload file(s)", message);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) {
      return;
    }
    const { files } = e.target;
    const filesToUpload = new Array(files.length);
    for (let i = 0; i < files.length; ++i) {
      // prefix already account for trailing "/"
      const Key = `${prefix}${files[i].name}`;
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
