import './Table.css'

type TableParams = {
  className: string
  columns: string[],
  data: any[][],
  onClick?: (element: React.MouseEvent<HTMLTableRowElement>, index: number) => void
}

export const Table = ({ className, columns, data, onClick }: TableParams) => {
  const Header = () => {
    return (
      <thead className="h-16">
        <tr >
          {columns.map(column =>
            <th className="bg-neutral-200"
              key={column}>
              {column}
            </th>)}
        </tr>
      </thead>
    );
  };

  const Body = () => {
    return (
      <tbody>
        {
          data.map((row, index) => {
            return <tr
              className="hover:bg-slate-200 hover:cursor-pointer"
              onClick={(el) => onClick?.(el, index)}
              key={index}>
              {row.map((el, index) => {
                return <td className="p-2 text-center border-neutral-200" key={index}>{el}</td>
              })}
            </tr>;
          })
        }
      </tbody>
    )
  }

  return (
    <table className={className}>
      <Header />
      <Body />
    </table>
  )
}