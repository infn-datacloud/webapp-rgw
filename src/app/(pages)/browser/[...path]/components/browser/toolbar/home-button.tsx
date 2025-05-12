import Link from "next/link";
import { HomeIcon } from "@heroicons/react/24/outline";

export default function HomeButton() {
  return (
    <Link
      href="/"
      className="border-primary bg-secondary text-primary hover:bg-primary-hover hover:text-secondary dark:border-secondary dark:text-secondary hover:bg-primary flex items-center gap-2 rounded-full border p-1 px-3 text-sm dark:bg-transparent"
    >
      <HomeIcon className="size-5" />
      Home
    </Link>
  );
}
