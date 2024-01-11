import { Column } from "./types";

export interface HeaderProps {
  selectable: boolean;
  columns: Column[];
}

const thClassName =
  "border-b font-medium p-4 first:pl-8 last:pr-8 pt-0" +
  "pb-3 text-left text-slate-800";

export const Header = (props: HeaderProps) => {
  const { selectable, columns } = props;
  return (
    <thead>
      <tr>
        {selectable ? <th></th> : null}
        {columns.map(column => (
          <th className={thClassName} key={column.id}>
            {column.name}
          </th>
        ))}
      </tr>
    </thead>
  );
};
