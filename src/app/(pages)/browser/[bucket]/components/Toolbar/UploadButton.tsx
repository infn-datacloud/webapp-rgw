import { InputFile } from "@/components/InputFile";
import { FileObjectWithProgress } from "@/models/bucket";
import { ArrowUpOnSquareIcon } from "@heroicons/react/24/outline";
import { useSession } from "next-auth/react";
import { S3Service } from "@/services/s3";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import { camelToWords } from "@/commons/utils";
import { s3ClientConfig } from "@/services/s3/actions";
import { useRouter } from "next/navigation";

export default function UploadButton(props: {
  bucket: string;
  currentPath: string;
}) {
  const { bucket, currentPath } = props;
  const { status, data } = useSession();
  const router = useRouter();
  const [objectsInProgress, setObjectsInProgress] = useState(
    new Map<string, FileObjectWithProgress>()
  );
  const s3Ref = useRef<S3Service | null>(null);

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

  const handleUploadsUpdates = (object: FileObjectWithProgress) => {
    if (object.progress < 1.0) {
      objectsInProgress.set(object.object.Key!, object);
      setObjectsInProgress(objectsInProgress);
    }
  };

  const handleUploadComplete = (object: FileObjectWithProgress) => {
    objectsInProgress.delete(object.object.Key!);
    setObjectsInProgress(objectsInProgress);
    if (objectsInProgress.size <= 1) {
      // notify(
      //   "Upload Complete",
      //   "All files have been successfully uploaded",
      //   NotificationType.success
      // );
      router.refresh();
    }
  };

  const uploadFiles = (files: FileObjectWithProgress[]) => {
    const s3 = s3Ref.current;
    if (!s3) {
      throw new Error("Cannot initialize S3 service");
    }
    try {
      files.forEach(file => {
        const onUpdate = () => handleUploadsUpdates(file);
        const onComplete = () => handleUploadComplete(file);
        s3.uploadObject(bucket, file, onUpdate, onComplete);
        objectsInProgress.set(file.object.Key!, file);
      });
      setObjectsInProgress(objectsInProgress);
    } catch (e) {
      const msg = e instanceof Error ? camelToWords(e.name) : "Unknown Error";
      console.error(e);
      // notify("Cannot upload file(s)", msg, NotificationType.error);
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

  return <InputFile icon={<ArrowUpOnSquareIcon />} onChange={handleChange} />;
}
