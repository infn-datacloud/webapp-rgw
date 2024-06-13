import { Column } from "./types";

export interface HeaderProps {
  selectable: boolean;
  columns: Column[];
}

export const Header = (props: HeaderProps) => {
  const { selectable, columns } = props;
  return (
    <thead>
      <tr>
        {selectable ? <th></th> : null}
        {columns.map(column => (
          <th
            className="border-b pb-3 pt-0 text-left font-medium text-primary first:pl-8 last:pr-8"
            key={column.id}
          >
            {column.name}
          </th>
        ))}
      </tr>
    </thead>
  );
};
