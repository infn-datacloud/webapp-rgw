import { Table, TableData } from "@/components/Table";

export type ObjectTableProps = {
  data: TableData;
  onSelect: (checked: boolean, index: number) => void;
  onClick: (index: number) => void;
};

export default function ObjectsTable(props: ObjectTableProps) {
  return (
    <div className="flex place-content-center mt-4">
      <Table selectable={true} {...props} />
    </div>
  );
}
