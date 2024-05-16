import { Page } from "@/components/Page";
import {
  Table,
  Column,
  Row,
  TableData,
  ColumnId,
  Cell,
} from "@/components/Table";
import { BucketInfo } from "@/models/bucket";
import { auth } from "@/auth";
import { S3Service } from "@/services/s3";
import BucketsTable from "./buckets-table";

export default async function Home() {
  const session = await auth();
  let bucketsInfos: BucketInfo[] = [];

  if (!session) {
    throw Error("Session is not available");
  }

  const { credentials } = session;
  if (credentials) {
    const s3 = new S3Service(credentials);
    bucketsInfos = await s3.getBucketsInfos();
  } else {
    throw new Error("Cannot find credentials");
  }

  const tableData: TableData = (function () {
    const cols: Column[] = [
      { id: "bucket", name: "Bucket" },
      { id: "creation_date", name: "Creation Date" },
    ];
    const rows = bucketsInfos.map((bucketInfo: BucketInfo): Row => {
      const cols = new Map<ColumnId, Cell>();
      cols.set("bucket", { value: bucketInfo.name ?? "N/A" });
      cols.set("creation_date", {
        value: bucketInfo.creation_date,
      });
      return {
        selected: false,
        columns: cols,
      };
    });
    return { rows, cols };
  })();

  return (
    <Page title="Home">
      <div className="flex place-content-center">
        <BucketsTable data={tableData} />
      </div>
    </Page>
  );
}
