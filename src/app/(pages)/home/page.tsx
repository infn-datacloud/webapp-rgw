import { Page } from "@/components/Page";
import { makeS3Client } from "@/services/s3/actions";
import { makeTableData } from "./utils";
import BucketsTable from "./buckets-table";
import { TableData } from "@/components/Table";
import { redirect } from "next/navigation";

export default async function Home() {
  let tableData: TableData = { cols: [], rows: [] };
  try {
    const s3 = await makeS3Client();
    const bucketsInfos = await s3.getBucketsInfos();
    tableData = makeTableData(bucketsInfos);
  } catch (err) {
    console.error(err);
    if (err instanceof Error && err.name === "AccessDenied") {
      redirect("/logout");
    } else {
      throw err;
    }
  }

  return (
    <Page title="Home">
      <div className="flex place-content-center">
        <BucketsTable data={tableData} />
      </div>
    </Page>
  );
}
