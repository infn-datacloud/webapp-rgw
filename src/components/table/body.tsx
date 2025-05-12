import { Row, TableData } from "./types";

interface SelectableCellProps {
  selected: boolean;
  onSelect?: (selected: boolean) => void;
}

const SelectableCell = (props: SelectableCellProps) => {
  const { selected, onSelect } = props;
  return (
    <td
      className="pl-4"
      onClick={_ => {
        onSelect?.(!selected);
      }}
    >
      <input
        type="checkbox"
        checked={selected}
        onChange={el => onSelect?.(el.target.checked)}
        id="table-checkbox"
      />
    </td>
  );
};

type TableDataCellProps = {
  children?: React.ReactNode;
  title?: string;
  onClick?: () => void;
  className?: string;
};

function TableDataCell(props: Readonly<TableDataCellProps>) {
  const { children, title, onClick, className } = props;
  return (
    <td
      title={title}
      className={
        "border-b border-slate-100 p-4 text-left dark:border-slate-600 " +
        className
      }
      onClick={onClick}
    >
      {children}
    </td>
  );
}

type TableRowProps = {
  row: Row;
  columnsIds: string[];
  selectable?: boolean;
  onClick?: () => void;
  onSelect?: (selected: boolean) => void;
};

function TableRow(props: Readonly<TableRowProps>) {
  const { row, columnsIds, selectable, onClick, onSelect } = props;

  const cells = columnsIds.map(colId => {
    const cell = row.columns.get(colId);
    const value = cell?.value ?? "N/A";
    const title = typeof value === "string" ? value : "";
    return (
      <TableDataCell
        title={title}
        key={colId}
        onClick={onClick}
        className={cell?.className}
      >
        {value}
      </TableDataCell>
    );
  });

  return (
    <tr
      className="text-primary hover:text-light dark:text-secondary dark:hover:bg-light dark:hover:text-secondary mx-0 cursor-pointer hover:bg-slate-200"
      key={row.id}
    >
      {selectable ? (
        <SelectableCell
          selected={row.selected}
          onSelect={selected => onSelect?.(selected)}
        />
      ) : null}
      {cells}
    </tr>
  );
}

export interface BodyProps {
  currentPage: number;
  itemsPerPage: number;
  data: TableData;
  selectable: boolean;
  onClick?: (index: number) => void;
  onSelect?: (selected: boolean, index: number) => void;
}

export const Body = (props: BodyProps) => {
  // prettier-ignore
  const {
    currentPage,
    itemsPerPage,
    data,
    selectable,
    onSelect,
    onClick
  } = props;

  const { rows, cols } = data;
  const start = currentPage * itemsPerPage;
  const end = start + itemsPerPage;
  const visibleRows = rows.slice(start, end);
  const columnIds = cols.map(col => col.id);

  return (
    <tbody className="bg-white dark:bg-slate-800">
      {visibleRows.map((row, rowIndex) => {
        const absoluteIndex = rowIndex + currentPage * itemsPerPage;
        return (
          <TableRow
            row={row}
            columnsIds={columnIds}
            key={row.id}
            selectable={selectable}
            onClick={() => onClick?.(absoluteIndex)}
            onSelect={(selected: boolean) =>
              onSelect?.(selected, absoluteIndex)
            }
          />
        );
      })}
    </tbody>
  );
};
