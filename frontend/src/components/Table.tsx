// import './Table.css'

type TableParams = {
  className: string
  columns: string[],
  data: any[][],
  onClick?: (element: React.MouseEvent<HTMLTableRowElement>, index: number) => void
}

export const Table = ({ className, columns, data, onClick }: TableParams) => {
  const Header = () => {
    return (
      <thead>
        <tr >
          {columns.map(column =>
            <th
              className="border-b font-medium p-4 first:pl-8 last:pr-8 pt-0 pb-3 
                text-left text-slate-800"
              key={column}>
              {column}
            </th>)}
        </tr>
      </thead>
    );
  };

  const Body = () => {
    return (
      <tbody className="bg-white">
        {
          data.map((row, index) => {
            return <tr
              className="hover:bg-slate-200 text-slate-500
               hover:text-slate-800 hover:cursor-pointer"
              onClick={(el) => onClick?.(el, index)}
              key={index}>
              {row.map((el, index) => {
                return <td
                  className="border-b border-slate-100 
                  p-4 first:pl-8 last:pr-8 text-left"
                  key={index}>
                  {el}
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