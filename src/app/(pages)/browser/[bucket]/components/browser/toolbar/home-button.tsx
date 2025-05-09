import { Button } from "@/components/buttons";
import { HomeIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";

export default function HomeButton() {
  const router = useRouter();
  const handleClick = () => {
    router.push("/");
  };
  return (
    <Button className="btn-secondary" title="Home" onClick={handleClick}>
      <HomeIcon className="size-5" />
      Home
    </Button>
  );
}
