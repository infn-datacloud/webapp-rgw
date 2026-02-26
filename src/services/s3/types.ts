// SPDX-FileCopyrightText: 2025 Istituto Nazionale di Fisica Nucleare
//
// SPDX-License-Identifier: EUPL-1.2

import { S3ClientConfig } from "@aws-sdk/client-s3";

export interface AWSConfig {
  endpoint: string;
  region: string;
  roleArn: string;
  roleSessionDurationSeconds: number;
}

export interface CreateBucketArgs {
  bucketName: string;
  versioningEnabled: boolean;
  objectLockEnabled: boolean;
}

export interface S3ServiceConfig {
  s3ClientConfig: S3ClientConfig;
  publisherBucket?: string;
  groups?: string[];
}
