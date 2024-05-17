import { Button } from "@/components/Button";
import { ArrowUturnRightIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";

export default function RefreshButton() {
  const router = useRouter();
  const handleClick = () => router.refresh();
  return (
    <Button
      title="Refresh"
      icon={<ArrowUturnRightIcon />}
      onClick={handleClick}
    />
  );
}
