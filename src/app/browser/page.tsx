// SPDX-FileCopyrightText: 2025 Istituto Nazionale di Fisica Nucleare
//
// SPDX-License-Identifier: EUPL-1.2

import { redirect } from "next/navigation";
import { getSession } from "@/auth";
import { Layout } from "@/app/components/layout";
import { S3Service } from "@/services/s3";
import { getS3ServiceConfig } from "@/services/s3/actions";
import BucketsTable from "./components/buckets-table";

export default async function Browser() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }
  const s3Config = await getS3ServiceConfig(session);
  const s3 = new S3Service(s3Config);
  const { publics, privates } = await s3.fetchBucketList();
  const buckets = [...privates, ...publics];
  return (
    <Layout title="Browser">
      <div className="flex place-content-center">
        <BucketsTable buckets={buckets} />
      </div>
    </Layout>
  );
}
