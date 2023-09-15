// import './Table.css'

import { ChangeEvent, MouseEvent, useState } from "react";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon
} from "@heroicons/react/24/outline";
import { truncateString } from "../commons/utils";

export interface Column {
  id: string
  name?: string,
}

export interface Value {
  columnId: string;
  value: string | React.ReactElement;
}

interface TableParams {
  columns: Column[];
  data: Value[][];
  selectable?: boolean;
  selectedRows?: Set<number>;
  onClick?: (element: MouseEvent<HTMLTableRowElement>, index: number) => void
  onSelect?: (element: ChangeEvent<HTMLInputElement>, index: number) => void
}

export const Table = (props: TableParams) => {
  const {
    columns,
    data,
    selectable = false,
    selectedRows,
    onClick,
    onSelect
  } = props;

  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const numberOfPages = Math.max(1, Math.ceil(data.length / itemsPerPage));

  if (currentPage > numberOfPages) {
    setCurrentPage(0);
  }

  const thClassName = "border-b font-medium p-4 first:pl-8 last:pr-8 pt-0" +
    "pb-3 text-left text-slate-800";

  const Header = () => {
    return (
      <thead>
        <tr >
          {selectable ? <th></th> : null}
          {columns.map(column =>
            <th
              className={thClassName}
              key={column.id}>
              {column.name}
            </th>)}
        </tr>
      </thead>
    );
  };

  const Body = () => {
    const start = currentPage * itemsPerPage;
    const end = start + itemsPerPage;
    const visibleData = data.slice(start, end);
    const rows = visibleData.map(row => {
      return row.reduce((acc: Map<string, string | React.ReactElement>, item) => {
        acc.set(item.columnId, item.value)
        return acc;
      }, new Map());
    })

    const columnIds = columns.map(col => col.id);

    return (
      <tbody className="bg-white">
        {
          rows.map((row, rowIndex) => {
            const absoluteIndex = rowIndex + currentPage * itemsPerPage;
            return <tr
              className="hover:bg-slate-200 text-slate-500
               hover:text-slate-800 hover:cursor-pointer"
              onClick={(el) => onClick?.(el, absoluteIndex)}
              key={rowIndex}>
              {
                selectable ?
                  <td className="pl-4">
                    <input
                      type="checkbox"
                      onChange={(el) => (onSelect && onSelect(el, absoluteIndex))}
                      checked={selectedRows && selectedRows.has(absoluteIndex)}
                      id="table-checkbox"
                    >
                    </input>
                  </td> : null
              }
              {columnIds.map((colId, index) => {
                const rawCell = row.get(colId);
                let parsedCell = rawCell;
                if (typeof parsedCell === "string") {
                  parsedCell = truncateString(parsedCell, 32);
                }
                return <td
                  title={typeof rawCell === "string" ? rawCell : ""}
                  className={"border-b border-slate-100 p-4 first:pl-8 " +
                    "last:pr-8 text-left " + colId}
                  key={index}>
                  {row.get(colId)}
                </td>
              })}
            </tr>
          })
        }
      </tbody>
    )
  }

  const Paginator = () => {
    const textStyle = "leading-tight text-gray-500 hover:text-gray-700 \
      dark:text-gray-400 dark:hover:text-white"
    const buttonStyle = "flex w-8 h-8 ml-0 bg-white border border-gray-300 \
      hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 \
      dark:hover:bg-gray-700"

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
              focus:border-blue-500 block dark:bg-gray-700 \
              dark:border-gray-600 dark:placeholder-gray-400 \
              dark:text-white dark:focus:ring-blue-500 \
              dark:focus:border-blue-500"
            onChange={(event) => setItemsPerPage(parseInt(event.currentTarget.value))}
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
              onClick={() => setCurrentPage(0)}
            >
              <ChevronDoubleLeftIcon className="w-5 m-auto" />
            </button>
          </li>
          <li>
            <button
              title="Previous Page"
              className={`${buttonStyle}`}
              onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
            >
              <ChevronLeftIcon className="w-5 m-auto" />
            </button>
          </li>
          <li>
            <button
              title="Next Page"
              className={`${buttonStyle}`}
              onClick={() => setCurrentPage(Math.min(numberOfPages - 1, currentPage + 1))}
            >
              <ChevronRightIcon className="w-5 m-auto" />
            </button>
          </li>
          <li>
            <button
              title="Last Page"
              className={`${buttonStyle} rounded-r-lg`}
              onClick={() => setCurrentPage(numberOfPages - 1)}
            >
              <ChevronDoubleRightIcon className="w-5 m-auto" />
            </button>
          </li>
        </ul>
      </div>
    )
  }

  return (
    <div className="w-full bg-slate-100 shadow-lg rounded-xl">
      <table className={"table-auto w-full text-sm mt-8 mb-6"}>
        <Header />
        <Body />
      </table>
      <Paginator />
    </div>
  )
}
