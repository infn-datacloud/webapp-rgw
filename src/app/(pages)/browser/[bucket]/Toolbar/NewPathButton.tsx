import { Button } from "@/components/Button";
import { FolderIcon } from "@heroicons/react/24/outline";

export default function NewPathButton() {
  const handleClick = () => {
    // show modal
  };
  return (
    <Button title="New path" icon={<FolderIcon />} onClick={handleClick} />
  );
}
