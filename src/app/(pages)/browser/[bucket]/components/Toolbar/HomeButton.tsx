import { Button } from "@/components/Button";
import { HomeIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";

export default function HomeButton() {
  const router = useRouter();
  const handleClick = () => {
    router.push("/");
  };
  return (
    <Button
      title="Home"
      icon={<HomeIcon />}
      color="primary-outline"
      onClick={handleClick}
    />
  );
}
