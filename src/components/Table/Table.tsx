"use client";
import { useState } from "react";
import { Paginator } from "./Paginator";
import { TableData } from "./types";
import { Header } from "./Header";
import { Body } from "./Body";

const DEFAULT_NUM_ITEMS_PER_PAGE = 10;

interface TableParams {
  data: TableData;
  selectable?: boolean;
  onClick?: (index: number) => void;
  onSelect?: (selected: boolean, index: number) => void;
}

export const Table = (props: TableParams) => {
  const { data, selectable = false, onClick, onSelect } = props;

  const { rows, cols } = data;
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(DEFAULT_NUM_ITEMS_PER_PAGE);
  const numberOfPages = Math.max(1, Math.ceil(rows.length / itemsPerPage));

  if (currentPage > numberOfPages) {
    setCurrentPage(0);
  }

  return (
    <div className="relative w-full overflow-auto rounded-xl bg-gray-100 shadow-lg">
      <div className="my-8 overflow-hidden shadow-sm">
        <table className={"w-full table-auto text-sm"}>
          <Header selectable={selectable} columns={cols} />
          <Body
            currentPage={currentPage}
            itemsPerPage={itemsPerPage}
            data={data}
            selectable={selectable}
            onSelect={onSelect}
            onClick={onClick}
          />
        </table>
      </div>
      <Paginator
        currentPage={currentPage}
        numberOfPages={numberOfPages}
        itemsPerPage={itemsPerPage}
        onChangeItemsPerPage={n => setItemsPerPage(n)}
        onChangePage={page => setCurrentPage(page)}
      />
    </div>
  );
};
