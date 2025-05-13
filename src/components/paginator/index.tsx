"use client";

import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

type PaginatorProps = {
  nextContinuationToken?: string;
};

export default function Paginator(props: Readonly<PaginatorProps>) {
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
    <div className="dark:text-secondary flex w-full items-center justify-between leading-tight text-gray-500">
      <ul className="flex">
        <li className="text-primary dark:text-secondary bg-secondary dark:bg-secondary/10 dark:hover:bg-secondary/20 min-w-16 rounded-tl-lg rounded-bl-lg border border-neutral-200 hover:bg-neutral-200">
          <button
            title="Previous Page"
            className="inline-flex p-1.5"
            onClick={goBack}
          >
            <ChevronLeftIcon className="size-5 h-[1lh]" />
            <span>Back</span>
          </button>
        </li>
        <li
          className="group text-primary dark:text-secondary bg-secondary dark:bg-secondary/10 data-[disabled=false]:dark:hover:bg-secondary/20 data-[disabled=true]:dark:text-secondary/30 min-w-16 justify-end rounded-tr-lg rounded-br-lg border border-neutral-200 data-[disabled=false]:hover:bg-neutral-200 data-[disabled=true]:text-slate-400"
          data-disabled={!nextContinuationToken}
        >
          <Link
            title="Next Page"
            className="flex justify-end p-1.5 group-data-[disabled=true]:cursor-default"
            href={nextPage}
          >
            <span>Next</span>
            <ChevronRightIcon className="size-5 h-[1lh]" />
          </Link>
        </li>
      </ul>
      <div className="dark:text-secondary/60 flex items-center space-x-2 text-slate-500">
        <span>Show</span>
        <select
          value={itemsPerPage}
          className="dark:text-secondary/80 block rounded-lg border border-gray-300 bg-gray-50 p-1 text-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-white/10"
          onChange={e => onChangeItemsPerPage(parseInt(e.currentTarget.value))}
        >
          <option value="10">10</option>
          <option value="20">20</option>
          <option value="50">50</option>
          <option value="100">100</option>
          <option value="200">200</option>
        </select>
        <span>items</span>
      </div>
    </div>
  );
}
