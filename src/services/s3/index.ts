// SPDX-FileCopyrightText: 2025 Istituto Nazionale di Fisica Nucleare
//
// SPDX-License-Identifier: EUPL-1.2

import {
  AssumeRoleWithWebIdentityCommand,
  STSClient,
} from "@aws-sdk/client-sts";
import { AWSConfig, CreateBucketArgs } from "./types";
import {
  _Object,
  Bucket,
  CommonPrefix,
  CreateBucketCommand,
  DeleteBucketCommand,
  DeleteObjectsCommand,
  GetBucketVersioningCommand,
  GetBucketVersioningCommandOutput,
  GetObjectCommand,
  GetObjectLockConfigurationCommand,
  HeadBucketCommand,
  ListBucketsCommand,
  ListObjectsV2Command,
  ObjectIdentifier,
  ObjectLockConfiguration,
  PutBucketVersioningCommand,
  PutObjectLockConfigurationCommand,
  S3Client,
  S3ClientConfig,
  VersioningConfiguration,
} from "@aws-sdk/client-s3";
import { AwsCredentialIdentity } from "@aws-sdk/types";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { dropDuplicates } from "@/commons/utils";

if (process.env.APP_ENV === "production") {
  console.debug = () => {};
  console.log = () => {};
  console.warn = () => {};
}

const awsConfig: AWSConfig = {
  endpoint: process.env.S3_ENDPOINT!,
  region: process.env.S3_REGION!,
  roleArn: process.env.S3_ROLE_ARN!,
  roleSessionDurationSeconds: parseInt(process.env.S3_ROLE_DURATION_SECONDS!),
};

export class S3Service {
  client: S3Client;
  publisherBucket?: string;
  groups?: string[];

  constructor(
    config: S3ClientConfig,
    publisherBucket?: string,
    groups?: string[]
  ) {
    this.client = new S3Client(config);
    this.publisherBucket = publisherBucket;
    this.groups = groups;
  }

  static async loginWithSTS(
    access_token: string
  ): Promise<AwsCredentialIdentity> {
    const config = awsConfig;
    const sts = new STSClient({ ...config });
    const command = new AssumeRoleWithWebIdentityCommand({
      DurationSeconds: config.roleSessionDurationSeconds,
      RoleArn: config.roleArn,
      RoleSessionName: crypto.randomUUID(),
      WebIdentityToken: access_token,
    });
    const response = await sts.send(command);
    const credentials = response.Credentials!;
    return {
      accessKeyId: credentials.AccessKeyId!,
      secretAccessKey: credentials.SecretAccessKey!,
      sessionToken: credentials.SessionToken!,
      expiration: credentials.Expiration,
    };
  }

  async fetchPublicBuckets() {
    // make const copies that won't change after the safety guard
    const publisherBucket = this.publisherBucket;
    const groups = this.groups;
    if (!publisherBucket || !groups) {
      console.warn(
        "Bucket publisher or groups not defined",
        this.publisherBucket,
        this.groups
      );
      return [];
    }

    const promises = groups.map(async group => {
      const cmd = new ListObjectsV2Command({
        Bucket: this.publisherBucket,
        Prefix: group,
      });
      return await this.client.send(cmd);
    });

    const results = await Promise.allSettled(promises);
    const success = results
      .filter(res => res.status === "fulfilled")
      .map(res => res.value);
    const contents = success.flatMap(bucket => bucket.Contents ?? []);
    const bucketNames = contents.map(bucket => {
      return bucket.Key!.split("/").splice(-1)[0];
    });
    bucketNames.push("scratch");
    const headPromises = bucketNames.map(key => {
      const headCmd = new HeadBucketCommand({ Bucket: key });
      return this.client.send(headCmd);
    });

    const validBuckets = (await Promise.allSettled(headPromises)).reduce(
      (acc: string[], next, index) => {
        if (next.status === "fulfilled") {
          acc.push(bucketNames[index]);
        } else {
          console.warn(
            `cannot head bucket '${bucketNames[index]}': reason '${next.reason}'`
          );
        }
        return acc;
      },
      []
    );
    const names = dropDuplicates(validBuckets);
    const buckets: Bucket[] = names.map(name => {
      return { Name: name };
    });
    return buckets;
  }

  async fetchPrivateBuckets() {
    let buckets: Bucket[] = [];
    const listBucketCmd = new ListBucketsCommand({});
    const response = await this.client.send(listBucketCmd);
    const { Buckets } = response;
    if (Buckets) {
      buckets = buckets.concat(Buckets);
    } else {
      console.warn("Warning: Expected Bucket[], got undefined");
    }
    return buckets;
  }

  async fetchBucketList() {
    const [privates, publics] = await Promise.all([
      this.fetchPrivateBuckets(),
      this.fetchPublicBuckets(),
    ]);
    return { privates, publics };
  }

  async listObjects(
    bucket: string,
    maxKeys = 10,
    prefix?: string,
    delimiter?: string,
    continuationToken?: string
  ) {
    try {
      const cmd = new ListObjectsV2Command({
        Bucket: bucket,
        ContinuationToken: continuationToken,
        Delimiter: delimiter,
        Prefix: prefix,
        MaxKeys: maxKeys,
      });
      return await this.client.send(cmd);
    } catch (err) {
      console.error(
        `cannot list object for bucket '${bucket}': '${err instanceof Error ? err.name : "unknown error"}'`
      );
    }
  }

  async searchObjects(
    bucket: string,
    prefix?: string,
    query?: string, // this query should be sanitized
    count: number = 10
  ) {
    const response = await this.listObjects(bucket, 1000, prefix, "/");

    if (!response) {
      return;
    }

    let objects: _Object[] = response?.Contents ?? [];
    let prefixes: CommonPrefix[] = response?.CommonPrefixes ?? [];

    const listsPromises =
      response?.CommonPrefixes?.map(folder => {
        return this.listObjects(
          bucket,
          count,
          `${prefix ? prefix : ""}${folder.Prefix}`
        );
      }) ?? [];

    if (prefixes.length) {
      const responses = await Promise.all(listsPromises);
      for (const r of responses) {
        if (r?.Contents) {
          objects = objects.concat(r.Contents);
        }
        if (r?.CommonPrefixes) {
          prefixes = prefixes.concat(r.CommonPrefixes);
        }
      }
    }

    if (query) {
      const lowerQuery = query.toLocaleLowerCase();
      objects = objects.filter(
        o => (o.Key?.toLowerCase().search(lowerQuery) ?? -1) > -1
      );
      prefixes = prefixes.filter(
        p => (p.Prefix?.toLocaleLowerCase().search(lowerQuery) ?? -1) > -1
      );
    }
    response.Contents = objects;
    response.CommonPrefixes = prefixes;
    return response;
  }

  async getBucketVersioning(
    bucket: string
  ): Promise<GetBucketVersioningCommandOutput> {
    const getBucketVersioningCommand = new GetBucketVersioningCommand({
      Bucket: bucket,
    });
    return await this.client.send(getBucketVersioningCommand);
  }

  async setBucketVersioning(bucket: string, enabled: boolean) {
    const versioningConfiguration: VersioningConfiguration = {
      Status: enabled ? "Enabled" : "Suspended",
    };
    const putVersioningCommand = new PutBucketVersioningCommand({
      Bucket: bucket,
      VersioningConfiguration: versioningConfiguration,
    });
    return await this.client.send(putVersioningCommand);
  }

  async getBucketObjectLock(bucket: string) {
    const cmd = new GetObjectLockConfigurationCommand({ Bucket: bucket });
    return await this.client.send(cmd);
  }

  async setBucketObjectLock(bucket: string, enabled: boolean) {
    const configuration: ObjectLockConfiguration = enabled
      ? {
          ObjectLockEnabled: "Enabled",
        }
      : {};

    const cmd = new PutObjectLockConfigurationCommand({
      Bucket: bucket,
      ObjectLockConfiguration: configuration,
    });
    return await this.client.send(cmd);
  }

  async createBucket(args: CreateBucketArgs) {
    const { bucketName, objectLockEnabled, versioningEnabled } = args;
    const createBucketCommand = new CreateBucketCommand({
      Bucket: bucketName,
      ObjectLockEnabledForBucket: objectLockEnabled,
    });
    const result = await this.client.send(createBucketCommand);
    if (versioningEnabled) {
      this.setBucketVersioning(bucketName, versioningEnabled);
    }
    return result;
  }

  async deleteBucket(bucket: string) {
    const cmd = new DeleteBucketCommand({ Bucket: bucket });
    return await this.client.send(cmd);
  }



  deleteObjects(Bucket: string, objects: ObjectIdentifier[]) {
    const cmd = new DeleteObjectsCommand({
      Bucket,
      Delete: {
        Objects: objects,
      },
    });
    return this.client.send(cmd);
  }

  async getPresignedUrl(bucket: string, key: string): Promise<string> {
    const cmdGetObj = new GetObjectCommand({
      Bucket: bucket,
      Key: key,
      ResponseContentDisposition: `attachment; filename="${key}"`,
      ResponseContentType: "application/octet-stream",
    });
    return await getSignedUrl(this.client, cmdGetObj, { expiresIn: 60 });
  }
}
