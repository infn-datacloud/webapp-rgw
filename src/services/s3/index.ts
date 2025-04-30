import {
  AssumeRoleWithWebIdentityCommand,
  STSClient,
} from "@aws-sdk/client-sts";
import { AWSConfig, CreateBucketArgs } from "./types";
import {
  Bucket,
  CreateBucketCommand,
  DeleteBucketCommand,
  DeleteObjectCommand,
  GetBucketVersioningCommand,
  GetBucketVersioningCommandOutput,
  GetObjectCommand,
  GetObjectLockConfigurationCommand,
  HeadBucketCommand,
  ListBucketsCommand,
  ListObjectsV2Command,
  ObjectLockConfiguration,
  PutBucketVersioningCommand,
  PutObjectLockConfigurationCommand,
  S3Client,
  S3ClientConfig,
  VersioningConfiguration,
  _Object,
} from "@aws-sdk/client-s3";
import { FileObjectWithProgress } from "@/models/bucket";
import { AwsCredentialIdentity } from "@aws-sdk/types";
import { Upload } from "@aws-sdk/lib-storage";
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
    continuationToken?: string
  ) {
    try {
      const cmd = new ListObjectsV2Command({
        Bucket: bucket,
        ContinuationToken: continuationToken,
        Delimiter: "/",
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

  async uploadObject(
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
      console.debug(`Object ${fileObject.object.Key} uploaded`);
      if (onComplete) {
        onComplete();
      }
    });
  }

  deleteObject(Bucket: string, Key: string) {
    const cmd = new DeleteObjectCommand({ Bucket, Key });
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
