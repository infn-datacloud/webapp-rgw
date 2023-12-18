import { truncateString } from "../../commons/utils";
import { TableData } from "./types";

interface SelectableCellProps {
  index: number;
  selected: boolean;
  onSelect?: (selected: boolean, index: number) => void;
}

const SelectableCell = (props: SelectableCellProps) => {
  const { index, selected, onSelect } = props;
  return (
    <td className="pl-4" onClick={(_) => {
      onSelect?.(!selected, index)
    }}>
      <input
        type="checkbox"
        checked={selected}
        onChange={el => onSelect?.(el.target.checked, index)}
        id="table-checkbox"
      />
    </td>
  )
}

export interface BodyProps {
  currentPage: number;
  itemsPerPage: number;
  data: TableData;
  selectable: boolean;
  onClick?: (index: number) => void
  onSelect?: (selected: boolean, index: number) => void
}

export const Body = (props: BodyProps) => {
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
  const visibleRows = rows.slice(start, end)
  const columnIds = cols.map(col => col.id);

  return (
    <tbody className="bg-white">
      {
        visibleRows.map((row, rowIndex) => {
          const absoluteIndex = rowIndex + currentPage * itemsPerPage;
          return <tr
            className="hover:bg-slate-200 text-slate-500
             hover:text-slate-800 hover:cursor-pointer"
            key={rowIndex}>
            {
              selectable ?
                <SelectableCell
                  index={absoluteIndex}
                  selected={row.selected}
                  onSelect={onSelect}
                /> : null
            }
            {columnIds.map((colId, index) => {
              const cell = row.columns.get(colId);
              if (!cell) {
                return <td>N/A</td>
              }
              const { value } = cell;
              let title = ""
              if (typeof value === "string") {
                title = truncateString(value, 32);
              }
              return <td
                title={title}
                className={"border-b border-slate-100 p-4 first:pl-8 " +
                  "last:pr-8 text-left " + colId}
                onClick={(_) => onClick?.(absoluteIndex)}
                key={index}>
                {value}
              </td>
            })}
          </tr>
        })
      }
    </tbody>
  )
}
