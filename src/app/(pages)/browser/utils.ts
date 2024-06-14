import { Cell, Column, Row, TableData } from "@/components/Table";
import { dateToHuman } from "@/commons/utils";
import { Bucket } from "@aws-sdk/client-s3";

export function makeTableData(buckets: Bucket[]): TableData {
  const cols: Column[] = [
    { id: "bucket", name: "Bucket" },
    { id: "creation_date", name: "Creation Date" },
  ];
  const validBuckets = buckets.filter(bucket => !!bucket.Name);
  const rows = validBuckets.map((bucket: Bucket): Row => {
    const cols = new Map<string, Cell>();
    const { Name, CreationDate } = bucket;
    cols.set("bucket", { value: Name ?? "N/A" });
    cols.set("creation_date", {
      value: CreationDate ? dateToHuman(new Date(CreationDate)) : "N/A",
    });
    return {
      id: bucket.Name!,
      selected: false,
      columns: cols,
    };
  });
  return { rows, cols };
}
