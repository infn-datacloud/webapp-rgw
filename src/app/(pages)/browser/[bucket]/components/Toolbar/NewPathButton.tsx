import { Button } from "@/components/Button";
import { FolderIcon } from "@heroicons/react/24/outline";
import { NewPathModal } from "./NewPathModal";
import Link from "next/link";

export type NewPathButton = {
  bucket: string;
  currentPath: string;
  onPathChange?: (newPath: string) => void;
};

export default function NewPathButton(props: NewPathButton) {
  const { bucket, currentPath, onPathChange } = props;
  return (
    <>
      <NewPathModal
        prefix={bucket}
        currentPath={currentPath}
        onPathChange={onPathChange}
      />
      <Link href={`/browser/${bucket}?modal=create-path`}>
        <Button title="New path" icon={<FolderIcon />} />
      </Link>
    </>
  );
}
