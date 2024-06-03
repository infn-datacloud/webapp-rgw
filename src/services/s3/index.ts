import {
  AssumeRoleWithWebIdentityCommand,
  STSClient,
} from "@aws-sdk/client-sts";
import { AWSConfig, CreateBucketArgs } from "./types";
import {
  Bucket,
  CreateBucketCommand,
  DeleteObjectCommand,
  GetBucketVersioningCommand,
  GetBucketVersioningCommandOutput,
  GetObjectCommand,
  GetObjectLockConfigurationCommand,
  ListBucketsCommand,
  ListObjectsV2Command,
  ListObjectsV2CommandOutput,
  ObjectLockConfiguration,
  PutBucketVersioningCommand,
  PutObjectLockConfigurationCommand,
  S3Client,
  S3ClientConfig,
  VersioningConfiguration,
  _Object,
} from "@aws-sdk/client-s3";
import { BucketInfo, FileObjectWithProgress } from "@/models/bucket";
import { AwsCredentialIdentity } from "@aws-sdk/types";
import { Upload } from "@aws-sdk/lib-storage";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { dropDuplicates } from "@/commons/utils";

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
    try {
      const response = await sts.send(command);
      const credentials = response.Credentials!;
      return {
        accessKeyId: credentials.AccessKeyId!,
        secretAccessKey: credentials.SecretAccessKey!,
        sessionToken: credentials.SessionToken!,
        expiration: credentials.Expiration,
      };
    } catch (err) {
      throw Error("Cannot obtain credentials from STS");
    }
  }

  async fetchPublicBuckets() {
    if (!(this.publisherBucket && this.groups)) {
      console.warn(
        "Bucket publisher or groups not defined",
        this.publisherBucket,
        this.groups
      );
      return [];
    }

    const promises = this.groups.map(async group => {
      const cmd = new ListObjectsV2Command({
        Bucket: this.publisherBucket,
        Prefix: group,
      });
      return await this.client.send(cmd);
    });
    const results = await Promise.all(promises);
    const contents = results.flatMap(bucket => bucket.Contents ?? []);
    let names = contents.map(c => {
      const keys = c.Key!.split("/");
      return keys[keys.length - 1];
    });
    names = dropDuplicates(names);
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
    return [...privates, ...publics];
  }

  async listObjects(bucket: string): Promise<_Object[]> {
    let content: _Object[] = [];
    let completed = false;
    let continuationToken: string | undefined = undefined;
    while (!completed) {
      const cmd = new ListObjectsV2Command({
        Bucket: bucket,
        ContinuationToken: continuationToken,
      });
      const response: ListObjectsV2CommandOutput = await this.client.send(cmd);
      const { Contents, IsTruncated, NextContinuationToken } = response;
      if (Contents) {
        content = content.concat(Contents);
        if (IsTruncated) {
          continuationToken = NextContinuationToken;
        } else {
          completed = true;
        }
      } else {
        return [];
      }
    }
    return content;
  }

  /** Compute Bucket Summary Info, counting all objects and summing their size */
  static computeBucketSummary(bucket: Bucket, objects: _Object[]) {
    const info: BucketInfo = {
      name: bucket.Name ?? "N/A",
      creation_date: bucket.CreationDate?.toString() ?? "N/A",
      rw_access: { read: true, write: true },
      objects: 0,
      size: 0,
    };
    if (objects) {
      objects.forEach(o => {
        ++info.objects;
        info.size += o.Size ?? 0.0;
      });
    }
    return info;
  }

  async getBucketsInfos() {
    const buckets = await this.fetchBucketList();
    buckets.push({ Name: "scratch" });
    const validBuckets = buckets.filter(bucket => !!bucket.Name);

    const promises = validBuckets.map(async bucket => {
      const { Name } = bucket;
      const objects = await this.listObjects(Name!);
      return S3Service.computeBucketSummary(bucket, objects);
    });
    const results = await Promise.allSettled(promises);
    let bucketsInfos: BucketInfo[] = [];
    for (const result of results) {
      result.status === "fulfilled"
        ? bucketsInfos.push(result.value)
        : console.warn(
            `cannot fetch bucket '${result.reason.BucketName}', ` +
              `reason '${result.reason.Code}'`
          );
    }
    return bucketsInfos;
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

  uploadObject(
    bucket: string,
    fileObject: FileObjectWithProgress,
    onChange?: () => void,
    onComplete?: () => void
  ) {
    const upload = new Upload({
      client: this.client,
      params: {
        Bucket: bucket,
        Key: fileObject.object.Key,
        Body: fileObject.file,
      },
    });
    upload.on("httpUploadProgress", progress => {
      if (onChange) {
        let { loaded, total } = progress;
        loaded = loaded ?? 0;
        total = total ?? 1;
        fileObject.setProgress(loaded / total);
        onChange();
      }
    });
    upload.done().then(() => {
      console.log(`Object ${fileObject.object.Key} uploaded`);
      if (onComplete) {
        onComplete();
      }
    });
  }

  deleteObject(Bucket: string, Key: string) {
    const cmd = new DeleteObjectCommand({ Bucket, Key });
    return this.client.send(cmd);
  }

  async getPresignedUrl(bucket: string, key: string) {
    const cmdGetObj = new GetObjectCommand({
      Bucket: bucket,
      Key: key,
      ResponseContentDisposition: `attachment; filename="${key}"`,
      ResponseContentType: "application/octet-stream",
    });
    return await getSignedUrl(this.client, cmdGetObj, { expiresIn: 60 });
  }
}
