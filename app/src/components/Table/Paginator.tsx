import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon
} from "@heroicons/react/24/outline";

export interface PaginatorProps {
  currentPage: number;
  numberOfPages: number;
  itemsPerPage: number;
  onChangeItemsPerPage: (itemsPerPage: number) => void;
  onChangePage: (page: number) => void;
}

export const Paginator = (props: PaginatorProps) => {
  const textStyle = "leading-tight text-gray-500 hover:text-gray-700"
  const buttonStyle = "flex w-8 h-8 ml-0 bg-white border border-gray-300 \
      hover:bg-gray-100"

  const {
    currentPage,
    numberOfPages,
    itemsPerPage,
    onChangeItemsPerPage,
    onChangePage
  } = props;

  return (
    <div className={`${textStyle} flex justify-between w-full items-center px-4 pb-2 -space-x-px`}>
      <div className="flex space-x-2 items-center">
        <div>
          Page {currentPage + 1} of {numberOfPages}
        </div>
        <div>
          Show
        </div>
        <select
          value={itemsPerPage}
          className="bg-gray-50 border border-gray-300 \
            text-gray-900 text-sm rounded-lg p-2.5 focus:ring-blue-500 \
            focus:border-blue-500 block"
          onChange={(e) => onChangeItemsPerPage(parseInt(e.currentTarget.value))}
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
          <button
            title="First Page"
            className={`${buttonStyle} rounded-l-lg`}
            onClick={() => onChangePage(0)}
          >
            <ChevronDoubleLeftIcon className="w-5 m-auto" />
          </button>
        </li>
        <li>
          <button
            title="Previous Page"
            className={`${buttonStyle}`}
            onClick={() => onChangePage(Math.max(0, currentPage - 1))}
          >
            <ChevronLeftIcon className="w-5 m-auto" />
          </button>
        </li>
        <li>
          <button
            title="Next Page"
            className={`${buttonStyle}`}
            onClick={() => onChangePage(Math.min(numberOfPages - 1, currentPage + 1))}
          >
            <ChevronRightIcon className="w-5 m-auto" />
          </button>
        </li>
        <li>
          <button
            title="Last Page"
            className={`${buttonStyle} rounded-r-lg`}
            onClick={() => onChangePage(numberOfPages - 1)}
          >
            <ChevronDoubleRightIcon className="w-5 m-auto" />
          </button>
        </li>
      </ul>
    </div>
  )
}