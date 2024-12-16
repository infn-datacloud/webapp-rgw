"use client";
import { Table, TableData } from "@/components/table";
import { useRouter } from "next/navigation";

export default function BucketsTable(props: { data: TableData }) {
  const { data } = props;
  const router = useRouter();

  const handleRowClick = (index: number) => {
    const bucketName = data.rows[index].columns.get("bucket")?.value;
    if (bucketName) {
      router.push(`/browser/${bucketName}`);
    } else {
      console.warn("Bucket's Name is empty");
    }
  };

  return (
    <>
      <Table data={data} onClick={handleRowClick} />
    </>
  );
}
