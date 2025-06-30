// SPDX-FileCopyrightText: 2025 Istituto Nazionale di Fisica Nucleare
//
// SPDX-License-Identifier: EUPL-1.2

import { Layout } from "@/app/components/layout";
import { makeS3Client } from "@/services/s3/actions";
import BucketsTable from "./components/buckets-table";

export default async function Browser() {
  const s3 = await makeS3Client();
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
