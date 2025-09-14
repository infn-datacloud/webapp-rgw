// SPDX-FileCopyrightText: 2025 Istituto Nazionale di Fisica Nucleare
//
// SPDX-License-Identifier: EUPL-1.2

import { Layout } from "@/app/components/layout";
import { LoadingBar } from "@/components/loading";
import { makeS3Client } from "@/services/s3/actions";
import { S3ServiceException } from "@aws-sdk/client-s3";
import { Suspense } from "react";
import { Browser } from "./components";
import UploaderProvider from "@/components/uploader";
import { SessionProvider } from "next-auth/react";

type AsyncBrowserProps = {
  params: Promise<{ path: [string] }>;
  searchParams?: Promise<{
    current?: string;
    next?: string;
    count?: string;
    q?: string;
  }>;
};

async function AsyncBrowser(props: Readonly<AsyncBrowserProps>) {
  const { path } = await props.params;
  const searchParams = await props.searchParams;
  const nextContinuationToken = searchParams?.next;
  const count = searchParams?.count ? parseInt(searchParams?.count) : undefined;

  const folder = path.splice(1).join("/");
  const bucket = path[0];
  let prefix = folder ? `${folder}/` : undefined;
  const filepath = `${bucket}/${folder}`;
  const delimiter = "/";

  if (!bucket) {
    return <p>Bucket not found</p>;
  }

  try {
    const s3 = await makeS3Client();
    const response = searchParams?.q
      ? await s3.searchObjects(bucket, prefix, searchParams.q)
      : await s3.listObjects(
          bucket,
          count,
          prefix,
          delimiter,
          nextContinuationToken
        );

    return (
      <Browser
        bucket={bucket}
        filepath={filepath}
        prefix={prefix}
        showFullKeys={searchParams?.q !== undefined}
        listObjectOutput={response}
      />
    );
  } catch (e) {
    if (e instanceof S3ServiceException) {
      if (e.name === "NoSuchBucket") {
        return (
          <div className="flex flex-col justify-center p-16 text-center">
            <h2 className="text-5xl font-medium">No such bucket :&#40;</h2>
            <p className="p-2">The bucket your are looking does not exists.</p>
          </div>
        );
      }
      if (e.name === "AccessDenied") {
        return (
          <div className="flex flex-col justify-center p-16 text-center">
            <h2 className="text-5xl font-medium">Access Denied</h2>
            <p className="p-2">
              You don&apos;t have access to view this resource.
            </p>
          </div>
        );
      }
    }
    return (
      <div className="flex flex-col justify-center p-16 text-center">
        <h2 className="text-5xl font-medium">Oops! :&#40;</h2>
        <p className="p-2">Something went wrong...</p>
      </div>
    );
  }
}

export default async function BrowserPage(props: Readonly<AsyncBrowserProps>) {
  const { path } = await props.params;
  const bucket = path[0];
  return (
    <Layout title={bucket}>
      <Suspense fallback={<LoadingBar show={true} />}>
        <AsyncBrowser {...props} />
      </Suspense>
    </Layout>
  );
}
