import { Cell, Column, ColumnId, Row, TableData } from "@/components/Table";
import { BucketInfo } from "@/models/bucket";

export function dateToHuman(date: Date) {
  return new Intl.DateTimeFormat("it-IT", {
    dateStyle: "medium",
    timeStyle: "medium",
    timeZone: "Europe/Rome",
  }).format(date);
}

export function makeTableData(infos: BucketInfo[]): TableData {
  const cols: Column[] = [
    { id: "bucket", name: "Bucket" },
    { id: "creation_date", name: "Creation Date" },
  ];
  const rows = infos.map((bucketInfo: BucketInfo): Row => {
    const cols = new Map<ColumnId, Cell>();
    const { name, creation_date } = bucketInfo;
    cols.set("bucket", { value: name ?? "N/A" });
    cols.set("creation_date", { value: dateToHuman(new Date(creation_date)) });
    return {
      selected: false,
      columns: cols,
    };
  });
  return { rows, cols };
}
