import { useCallback, useEffect, useReducer, useRef } from "react";
import { CreateBucketArgs } from "./types";
import {
  STSClient,
  AssumeRoleWithWebIdentityCommand,
} from "@aws-sdk/client-sts";
import type { AWSConfig } from "./types";
import {
  Bucket,
  ListBucketsCommand,
  GetObjectCommand,
  S3Client,
  ListObjectsV2Command,
  _Object,
  CreateBucketCommand,
  PutBucketVersioningCommand,
  GetBucketVersioningCommand,
  VersioningConfiguration,
  DeleteBucketCommand,
  GetBucketVersioningCommandOutput,
  GetObjectLockConfigurationCommand,
  PutObjectLockConfigurationCommand,
  ListObjectsV2CommandOutput,
  DeleteObjectCommand,
  HeadBucketCommand,
  ObjectLockConfiguration,
} from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { useNotifications, NotificationType } from "../Notifications";
import {
  BucketObjectWithProgress,
  FileObjectWithProgress,
} from "../../models/bucket";
import { camelToWords, dropDuplicates } from "../../commons/utils";
import { AwsCredentialIdentity } from "@aws-sdk/types";
import { S3Cache, initialAuthState } from "./S3State";
import { reducer } from "./reducer";
import { S3Context } from "./S3Context";
import type { User } from "../OAuth";

const ONE_MB = 1024 * 1024;
const S3_CONFIG_STORAGE_KEY = "s3-config-storage-key";

interface S3PropsBase {
  children?: React.ReactNode;
}

export interface S3ProviderProps extends S3PropsBase {
  awsConfig: AWSConfig;
}

export const S3Provider = (props: S3ProviderProps): JSX.Element => {
  const { children, awsConfig } = props;
  const { notify } = useNotifications();
  const [state, dispatch] = useReducer(reducer, initialAuthState);
  const didInit = useRef(false);

  const cacheConfiguration = useCallback((config: S3Cache) => {
    sessionStorage.setItem(S3_CONFIG_STORAGE_KEY, JSON.stringify(config));
  }, []);

  const loadCacheConfiguration = useCallback((): S3Cache | undefined => {
    const maybe_config = sessionStorage.getItem(S3_CONFIG_STORAGE_KEY);
    if (maybe_config) {
      return JSON.parse(maybe_config);
    }
  }, []);

  const clearCache = () => {
    sessionStorage.clear();
  };

  const logout = useCallback(() => {
    clearCache();
    dispatch({ type: "LOGGED_OUT" });
  }, []);

  useEffect(() => {
    if (!didInit.current) {
      const cache = loadCacheConfiguration();
      if (cache) {
        const newState = {
          client: new S3Client(cache.clientConfiguration),
          externalBuckets: cache.externalBuckets,
        };
        dispatch({ type: "LOGGED_IN", ...newState });
        console.log("Session loaded");
      }
      didInit.current = true;
    }
  }, [loadCacheConfiguration]);

  const fetchPublicBuckets = useCallback(
    async (client: S3Client, bucketPublisher: string, groups: string[]) => {
      const promises = groups.map(async group => {
        const cmd = new ListObjectsV2Command({
          Bucket: bucketPublisher,
          Prefix: group,
        });
        return await client.send(cmd);
      });

      const results = await Promise.all(promises);
      const contents = results.flatMap(bucket => bucket.Contents ?? []);
      let names = contents.map(c => c.Key?.split("/")[1]);
      names = dropDuplicates(names);
      const buckets: Bucket[] = names.map(name => {
        return { Name: name };
      });
      return buckets;
    },
    []
  );
  // Exchange token for AWS Credentials with AssumeRoleWebIdentity
  const loginWithSTS = useCallback(
    async (user: User) => {
      dispatch({ type: "LOGGING_IN" });
      const { access_token } = user;
      if (!access_token) {
        console.error("Cannot get AWS credentials: access_token is undefined");
        return;
      }
      console.log("Get AWS Credentials from STS");
      const sts = new STSClient({ ...awsConfig });
      const command = new AssumeRoleWithWebIdentityCommand({
        DurationSeconds: awsConfig.roleSessionDurationSeconds,
        RoleArn: awsConfig.roleArn,
        RoleSessionName: crypto.randomUUID(),
        WebIdentityToken: access_token,
      });
      const response = await sts.send(command);

      try {
        const { Credentials } = response;
        if (!Credentials) {
          throw new Error("Credentials not found");
        }
        const { AccessKeyId, SecretAccessKey, SessionToken } = Credentials;
        if (!(AccessKeyId && SecretAccessKey && SessionToken)) {
          console.warn(
            "Warning: some one or more AWS Credentials member is empty"
          );
          return;
        }
        const awsCredentials = {
          accessKeyId: AccessKeyId,
          secretAccessKey: SecretAccessKey,
          sessionToken: SessionToken,
        };
        const clientConfiguration = {
          endpoint: awsConfig.endpoint,
          region: awsConfig.region,
          credentials: awsCredentials,
          forcePathStyle: true,
        };
        const { groups } = user.profile;
        const client = new S3Client(clientConfiguration);
        let externalBuckets: Bucket[] = [];
        try {
          if (groups) {
            externalBuckets = await fetchPublicBuckets(
              client,
              "bucket-policy",
              groups
            );
          }
        } catch (error) {
          console.error(error);
        }
        const toCache: S3Cache = { clientConfiguration, externalBuckets };
        cacheConfiguration(toCache);
        dispatch({ type: "LOGGED_IN", client, externalBuckets });
        console.log("Authenticated via STS");
      } catch (err) {
        if (err instanceof Error) {
          logout();
          notify(
            "Cannot retrieve AWS Credentials from STS",
            camelToWords(err.name),
            NotificationType.error
          );
        } else {
          console.error(err);
        }
      }
    },
    [awsConfig, notify, cacheConfiguration, logout, fetchPublicBuckets]
  );

  const loginWithCredentials = useCallback(
    async (credentials: AwsCredentialIdentity) => {
      dispatch({ type: "LOGGING_IN" });
      const { endpoint, region } = awsConfig;
      const clientConfiguration = {
        endpoint: endpoint,
        region: region,
        credentials: credentials,
        forcePathStyle: true,
      };
      try {
        const client = new S3Client(clientConfiguration);
        await client.send(new ListBucketsCommand({}));
        cacheConfiguration({ clientConfiguration, externalBuckets: [] });
        dispatch({ type: "LOGGED_IN", client, externalBuckets: [] });
        console.log("Logged with plain credentials");
      } catch (err) {
        logout();
        if (err instanceof Error) {
          notify(
            "Access failed",
            camelToWords(err.name),
            NotificationType.error
          );
        }
      }
    },
    [awsConfig, cacheConfiguration, notify, logout]
  );

  const fetchBucketList = async () => {
    try {
      const { client } = state;
      let buckets = state.externalBuckets;
      const listBucketCmd = new ListBucketsCommand({});
      const response = await client.send(listBucketCmd);
      const { Buckets } = response;
      if (Buckets) {
        buckets = buckets.concat(Buckets);
      } else {
        console.warn("Warning: Expected Bucket[], got undefined");
        return [];
      }
      return buckets;
    } catch (err) {
      if (err instanceof Error) {
        notify(
          "Cannot fetch buckets list",
          camelToWords(err.message),
          NotificationType.error
        );
      }
    }
    return [];
  };

  const headBucket = async (bucket: Bucket) => {
    try {
      const { client } = state;
      const cmd = new HeadBucketCommand({ Bucket: bucket.Name });
      await client.send(cmd);
      return true;
    } catch (err) {
      if (err instanceof Error) {
        const msg =
          err.name === "403" ? "Access Denied" : camelToWords(err.name);
        notify(
          `Cannot access bucket "${bucket.Name}"`,
          msg,
          NotificationType.error
        );
      }
    }
    return false;
  };

  const createBucket = async (args: CreateBucketArgs) => {
    const { bucketName, objectLockEnabled, versioningEnabled } = args;
    const createBucketCommand = new CreateBucketCommand({
      Bucket: bucketName,
      ObjectLockEnabledForBucket: objectLockEnabled,
    });
    const { client } = state;
    const result = await client.send(createBucketCommand);

    if (versioningEnabled) {
      setBucketVersioning(bucketName, versioningEnabled);
    }
    return result;
  };

  const deleteBucket = async (bucket: string) => {
    const { client } = state;
    const cmd = new DeleteBucketCommand({ Bucket: bucket });
    return await client.send(cmd);
  };

  const listObjects = async (bucket: Bucket): Promise<_Object[]> => {
    const { client } = state;
    let content: _Object[] = [];
    let completed = false;
    let continuationToken: string | undefined = undefined;
    while (!completed) {
      const cmd = new ListObjectsV2Command({
        Bucket: bucket.Name,
        ContinuationToken: continuationToken,
      });
      const response: ListObjectsV2CommandOutput = await client.send(cmd);
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
  };

  const getPresignedUrl = async (bucket: string, key: string) => {
    const { client } = state;
    const cmdGetObj = new GetObjectCommand({
      Bucket: bucket,
      Key: key,
      ResponseContentDisposition: `attachment; filename="${key}"`,
      ResponseContentType: "application/octet-stream",
    });
    return getSignedUrl(client, cmdGetObj, { expiresIn: 60 });
  };

  const getObjectRange = (
    bucket: string,
    key: string,
    start: number,
    end: number
  ) => {
    const { client } = state;
    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: key,
      Range: `bytes=${start}-${end}`,
    });
    return client.send(command);
  };

  const downloadInChunks = async (
    bucket: string,
    object: BucketObjectWithProgress,
    onChange?: () => void
  ) => {
    const key = object.object.Key!;
    let blob = new Blob();
    const length = object.object.Size!;
    const range = { start: -1, end: -1 };

    while (length - range.end !== 1) {
      const { end } = range;
      const nextRange = { start: end + 1, end: end + ONE_MB };
      const { Body, ContentLength } = await getObjectRange(
        bucket,
        key,
        nextRange.start,
        nextRange.end
      );

      if (!(Body && ContentLength)) {
        console.error("Cannot retrieve object");
        break;
      }

      blob = new Blob([blob, await Body.transformToByteArray()]);
      object.progress = blob.size / length;
      range.end += ContentLength;
      if (onChange) {
        onChange();
      }
    }
    console.log("Download completed", blob.size, "bytes");
    return blob;
  };

  const uploadManaged = async (
    bucket: string,
    fileObject: FileObjectWithProgress,
    onChange?: () => void
  ) => {
    const { client } = state;
    const upload = new Upload({
      client: client,
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
    return upload.done();
  };

  const getBucketVersioning = async (
    bucket: string
  ): Promise<GetBucketVersioningCommandOutput> => {
    const { client } = state;
    const getBucketVersioningCommand = new GetBucketVersioningCommand({
      Bucket: bucket,
    });
    return await client.send(getBucketVersioningCommand);
  };

  const setBucketVersioning = async (bucket: string, enabled: boolean) => {
    const { client } = state;
    const versioningConfiguration: VersioningConfiguration = {
      Status: enabled ? "Enabled" : "Suspended",
    };
    const putVersioningCommand = new PutBucketVersioningCommand({
      Bucket: bucket,
      VersioningConfiguration: versioningConfiguration,
    });
    return await client.send(putVersioningCommand);
  };

  const getBucketObjectLock = async (bucket: string) => {
    const { client } = state;
    const cmd = new GetObjectLockConfigurationCommand({ Bucket: bucket });
    return await client.send(cmd);
  };

  const setBucketObjectLock = async (bucket: string, enabled: boolean) => {
    const configuration: ObjectLockConfiguration = enabled
      ? {
          ObjectLockEnabled: "Enabled",
        }
      : {};
    const { client } = state;
    const cmd = new PutObjectLockConfigurationCommand({
      Bucket: bucket,
      ObjectLockConfiguration: configuration,
    });
    return await client.send(cmd);
  };

  const downloadObject = downloadInChunks;
  const uploadObject = uploadManaged;

  const deleteObject = async (Bucket: string, Key: string) => {
    const { client } = state;
    const cmd = new DeleteObjectCommand({ Bucket, Key });
    return await client.send(cmd);
  };

  return (
    <S3Context.Provider
      value={{
        ...state,
        loginWithSTS,
        loginWithCredentials,
        logout,
        fetchBucketList,
        headBucket,
        getPresignedUrl,
        createBucket,
        deleteBucket,
        listObjects,
        downloadObject,
        uploadObject,
        deleteObject,
        getBucketVersioning,
        setBucketVersioning,
        getBucketObjectLock,
        setBucketObjectLock,
      }}
    >
      {children}
    </S3Context.Provider>
  );
};
