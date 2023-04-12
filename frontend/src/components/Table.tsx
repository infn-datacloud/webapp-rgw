// import './Table.css'


export interface Column {
  id: string
  name?: string,
}

export interface Value {
  columnId: string,
  value: any
}

interface TableParams {
  columns: Column[],
  data: Value[][],
  selectable?: boolean
  onClick?: (element: React.MouseEvent<HTMLTableRowElement>, index: number) => void
}

export const Table = ({ columns, data, selectable = false, onClick }: TableParams) => {
  const thClassName = "border-b font-medium p-4 first:pl-8 last:pr-8 pt-0 pb-3 \
    text-left text-slate-800";
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
    const rows = data.map(row => {
      return row.reduce((acc: any, item) => {
        acc[item.columnId] = item.value;
        return acc;
      }, new Map());
    })

    const columnIds = columns.map(col => col.id);

    return (
      <tbody className="bg-white">
        {
          rows.map((row, rowIndex) => {
            return <tr
              className="hover:bg-slate-200 text-slate-500
               hover:text-slate-800 hover:cursor-pointer"
              onClick={(el) => onClick?.(el, rowIndex)}
              key={rowIndex}>
              {selectable ? <th className="pl-4"><input type="checkbox"></input></th> : null}
              {columnIds.map((colId, index) => {
                return <td
                  className="border-b border-slate-100 
                  p-4 first:pl-8 last:pr-8 text-left"
                  key={index}>
                  {row[colId]}
                </td>
              })}
            </tr>;
          })
        }
      </tbody>
    )
  }

  return (
    <div className="w-full bg-slate-100 shadow-lg rounded-xl">
      <table className={"table-auto w-full text-sm mt-8 mb-6"}>
        <Header />
        <Body />
      </table>
    </div>

  )
}