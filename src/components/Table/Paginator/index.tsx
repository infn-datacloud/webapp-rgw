import PaginatorButton from "./page-button";

export interface PaginatorProps {
  currentPage: number;
  numberOfPages: number;
  itemsPerPage: number;
  onChangeItemsPerPage: (itemsPerPage: number) => void;
  onChangePage: (page: number) => void;
}

export const Paginator = (props: PaginatorProps) => {
  const textStyle = "leading-tight text-gray-500 hover:text-gray-700";

  const {
    currentPage,
    numberOfPages,
    itemsPerPage,
    onChangeItemsPerPage,
    onChangePage,
  } = props;

  return (
    <div
      className={`${textStyle} flex w-full items-center justify-between -space-x-px px-4 pb-2 text-sm`}
    >
      <div className="flex items-center space-x-2">
        <div>
          Page {currentPage + 1} of {numberOfPages}
        </div>
        <div>Show</div>
        <select
          value={itemsPerPage}
          className="block rounded-lg border border-gray-300 bg-gray-50 p-1 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500"
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
          <PaginatorButton type="first" onClick={() => onChangePage(0)} />
        </li>
        <li>
          <PaginatorButton
            type="previous"
            onClick={() => onChangePage(Math.max(0, currentPage - 1))}
          />
        </li>
        <li>
          <PaginatorButton
            type="next"
            onClick={() =>
              onChangePage(Math.min(numberOfPages - 1, currentPage + 1))
            }
          />
        </li>
        <li>
          <PaginatorButton
            type="last"
            onClick={() => onChangePage(numberOfPages - 1)}
          />
        </li>
      </ul>
    </div>
  );
};
