import './Table.css'

type TableParams = {
  className: string
  columns: string[],
  data: any[][]
}

export const Table = ({ className, columns, data }: TableParams) => {
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
            return <tr className="hover:bg-slate-200" key={index}>
              {row.map((el, index) => {
                return <td className="p-4 text-center border-neutral-200" key={index}>{el}</td>
              })}
            </tr>;
          })
        }
      </tbody>
    )
  }
  // className += " border-separate border-spacing-0"
  return (
    <table className={className}>
      <Header />
      <Body />
    </table>
  )
}