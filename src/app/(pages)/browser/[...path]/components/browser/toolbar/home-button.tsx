import Link from "next/link";
import { HomeIcon } from "@heroicons/react/24/outline";

export default function HomeButton() {
  return (
    <Link
      href="/"
      className="flex items-center rounded-full border border-primary bg-secondary p-1 px-3 text-sm text-primary hover:bg-primary-hover hover:text-secondary dark:border-secondary dark:bg-primary-dark dark:text-secondary"
    >
      <HomeIcon className="size-5" />
      Home
    </Link>
  );
}
