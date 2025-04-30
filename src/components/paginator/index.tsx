"use client";

import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

type PaginatorProps = {
  nextContinuationToken?: string;
};

export default function Paginator(props: Readonly<PaginatorProps>) {
  const className =
    "flex p-0.5 ml-0 bg-white text-primary/50 border border-primary/10 hover:bg-infn/10 dark:bg-secondary/50 dark:text-secondary dark:hover:text-primary dark:hover:bg-white/70";

  const { nextContinuationToken } = props;

  const router = useRouter();
  const searchParams = useSearchParams();
  const currentPath = usePathname();
  const itemsPerPage = Number(searchParams.get("count")) || 10;

  const goBack = () => {
    window.history.back();
  };

  const nextPage = (() => {
    const params = new URLSearchParams(searchParams);
    if (nextContinuationToken) {
      params.set("next", nextContinuationToken);
    } else {
      params.delete("next");
    }
    return `${currentPath}?${params.toString()}`;
  })();

  const onChangeItemsPerPage = (newCount: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("count", newCount.toString());
    const url = `${currentPath}?${params.toString()}`;
    router.push(url);
  };

  return (
    <div className="flex w-full items-center justify-between -space-x-px p-4 leading-tight text-gray-500 hover:text-gray-700">
      <div className="flex items-center space-x-2">
        <div>Show</div>
        <select
          value={itemsPerPage}
          className="block rounded-lg border border-gray-300 bg-gray-50 p-1 text-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-white/10 dark:text-secondary/50"
          onChange={e => onChangeItemsPerPage(parseInt(e.currentTarget.value))}
        >
          <option value="10">10</option>
          <option value="20">20</option>
          <option value="50">50</option>
          <option value="100">100</option>
          <option value="200">200</option>
        </select>
      </div>
      <ul className="flex">
        <li>
          <button title="Previous Page" className={className} onClick={goBack}>
            <ChevronLeftIcon className="m-auto w-5" />
          </button>
        </li>
        <li>
          <Link title="Next Page" className={className} href={nextPage}>
            <ChevronRightIcon className="m-auto w-5" />
          </Link>
        </li>
      </ul>
    </div>
  );
}
