import { Cell, Column, ColumnId, Row, TableData } from "@/components/Table";
import { BucketInfo } from "@/models/bucket";
import moment from "moment";

export function makeTableData(infos: BucketInfo[]): TableData {
  const cols: Column[] = [
    { id: "bucket", name: "Bucket" },
    { id: "creation_date", name: "Creation Date" },
  ];
  const rows = infos.map((bucketInfo: BucketInfo): Row => {
    const cols = new Map<ColumnId, Cell>();
    const { name, creation_date } = bucketInfo;
    cols.set("bucket", { value: name ?? "N/A" });
    cols.set("creation_date", { value: moment(creation_date).calendar() });
    return {
      selected: false,
      columns: cols,
    };
  });
  return { rows, cols };
}
