// SPDX-FileCopyrightText: 2025 Istituto Nazionale di Fisica Nucleare
//
// SPDX-License-Identifier: EUPL-1.2

import { makeS3Client } from "@/services/s3/actions";
import { Bucket } from "@aws-sdk/client-s3";
import { Layout } from "@/app/components/layout";
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
  const s3 = await makeS3Client();
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
