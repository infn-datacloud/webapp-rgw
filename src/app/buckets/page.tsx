// SPDX-FileCopyrightText: 2025 Istituto Nazionale di Fisica Nucleare
//
// SPDX-License-Identifier: EUPL-1.2

import { redirect } from "next/navigation";
import { getSession } from "@/auth";
import { Layout } from "@/app/components/layout";
import { S3Service } from "@/services/s3";
import { getS3ServiceConfig } from "@/services/s3/actions";
import { Bucket } from "@aws-sdk/client-s3";
import { BucketInfo, Toolbar } from "./components";

function BucketsInfos(props: { buckets: Bucket[]; isPublic: boolean }) {
  const { buckets, isPublic } = props;
  return (
    <>
      {buckets.map(bucket => (
        <BucketInfo key={bucket.Name} bucket={bucket} isPublic={isPublic} />
      ))}
    </>
  );
}

export default async function Buckets() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }
  const s3Config = await getS3ServiceConfig(session);
  const s3 = new S3Service(s3Config);
  const buckets = await s3.fetchBucketList();
  return (
    <Layout title="Buckets">
      <Toolbar />
      <ul className="flex flex-col gap-4 pt-4">
        <BucketsInfos buckets={buckets.privates} isPublic={false} />
        <BucketsInfos buckets={buckets.publics} isPublic={true} />
      </ul>
    </Layout>
  );
}
