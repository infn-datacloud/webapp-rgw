import { useCallback, useEffect, useReducer, useRef } from "react";
import { CreateBucketArgs } from "./types";
import { STSClient, AssumeRoleWithWebIdentityCommand } from "@aws-sdk/client-sts";
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
  S3ClientConfig,
} from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { useNotifications, NotificationType } from "../Notifications";
import { BucketObjectWithProgress, FileObjectWithProgress } from "../../models/bucket";
import { camelToWords } from "../../commons/utils";
import { AwsCredentialIdentity } from "@aws-sdk/types";
import { initialAuthState } from "./S3State";
import { reducer } from "./reducer";
import { User } from "oidc-client-ts";
import { S3Context } from "./S3Context";

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
  const { client } = state;
  const didInit = useRef(false);

  const cacheConfiguration = (config: S3ClientConfig) => {
    sessionStorage.setItem(S3_CONFIG_STORAGE_KEY, JSON.stringify(config));
  }

  const loadCacheConfiguration = useCallback((): S3ClientConfig | undefined => {
    const maybe_config = sessionStorage.getItem(S3_CONFIG_STORAGE_KEY);
    if (maybe_config) {
      return JSON.parse(maybe_config);
    }
  }, []);

  const clearCache = () => {
    sessionStorage.clear();
  }

  useEffect(() => {
    if (!didInit.current) {
      const config = loadCacheConfiguration();
      if (config) {
        const client = new S3Client(config);
        dispatch({ type: "LOGGED_IN", client });
        console.log("Session loaded");
      }
      didInit.current = true;
    }
  }, [loadCacheConfiguration]);

  // Exchange token for AWS Credentials with AssumeRoleWebIdentity
  const loginWithSTS = useCallback(async (user: User) => {
    dispatch({ type: "LOGGING_IN" });
    const access_token = user.access_token;
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
      if (AccessKeyId && SecretAccessKey && SessionToken) {
        const awsCredentials = {
          accessKeyId: AccessKeyId,
          secretAccessKey: SecretAccessKey,
          sessionToken: SessionToken
        }
        const { endpoint, region } = awsConfig;
        const config = {
          endpoint: endpoint,
          region: region,
          credentials: awsCredentials,
          forcePathStyle: true
        };
        const client = new S3Client(config)
        dispatch({ type: "LOGGED_IN", client });
        cacheConfiguration(config);
        console.log("Authenticated via STS");
      } else {
        console.warn("Warning: some one or more AWS Credentials member is empty");
      }
    } catch (err) {
      if (err instanceof Error) {
        notify("Cannot retrieve AWS Credentials from STS",
          camelToWords(err.name), NotificationType.error);
      } else {
        console.error(err);
      }
      dispatch({ type: "LOGGED_OUT" });
      clearCache();
    }
  }, [awsConfig, notify]);

  const loginWithCredentials = useCallback(async (credentials: AwsCredentialIdentity) => {
    dispatch({ type: "LOGGING_IN" });
    const { endpoint, region } = awsConfig;
    const config = {
      endpoint: endpoint,
      region: region,
      credentials: credentials,
      forcePathStyle: true
    }
    const newClient = new S3Client(config);
    try {
      await newClient.send(new ListBucketsCommand({}));
      console.log("Logged with plain credentials");
      cacheConfiguration(config);
      dispatch({ type: "LOGGED_IN", client: newClient });
    } catch (err) {
      dispatch({ type: "LOGGED_OUT" });
      clearCache();
      if (err instanceof Error) {
        notify("Access failed", camelToWords(err.name), NotificationType.error);
      }
    }
  }, [awsConfig, notify]);

  const logout = () => {
    clearCache();
    dispatch({ type: "LOGGED_OUT" });
  }

  const fetchBucketList = async () => {
    const listBucketCmd = new ListBucketsCommand({});
    const response = await client.send(listBucketCmd)
    const { Buckets } = response;
    if (Buckets) {
      return Buckets;
    } else {
      console.warn("Warning: Expected Bucket[], got undefined");
      return [];
    }
  };

  const createBucket = async (args: CreateBucketArgs) => {
    const { bucketName, objectLockEnabled, versioningEnabled } = args;
    const createBucketCommand = new CreateBucketCommand({
      Bucket: bucketName,
      ObjectLockEnabledForBucket: objectLockEnabled,
    });

    const result = await client.send(createBucketCommand);

    if (versioningEnabled) {
      setBucketVersioning(bucketName, versioningEnabled);
    }
    return result;
  };

  const deleteBucket = async (bucket: string) => {
    const cmd = new DeleteBucketCommand({ Bucket: bucket });
    return await client.send(cmd);
  };

  const listObjects = async (bucket: Bucket): Promise<_Object[]> => {
    let content: _Object[] = []
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
    const cmdGetObj = new GetObjectCommand({
      Bucket: bucket,
      Key: key,
      ResponseContentDisposition: `attachment; filename="${key}"`,
      ResponseContentType: "application/octet-stream"
    });
    return getSignedUrl(client, cmdGetObj, { expiresIn: 60 });
  };

  const getObjectRange = (bucket: string, key: string, start: number, end: number) => {
    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: key,
      Range: `bytes=${start}-${end}`
    });
    return client.send(command);
  };

  const downloadInChunks = async (bucket: string, object: BucketObjectWithProgress, onChange?: () => void) => {
    const key = object.object.Key!;
    let blob = new Blob();
    const length = object.object.Size!;
    const range = { start: -1, end: -1 };

    while (length - range.end !== 1) {
      const { end } = range;
      const nextRange = { start: end + 1, end: end + ONE_MB };
      const { Body, ContentLength } = await getObjectRange(bucket, key,
        nextRange.start, nextRange.end);

      if (!(Body && ContentLength)) {
        console.error("Cannot retrieve object");
        break;
      }

      blob = new Blob([blob, await Body.transformToByteArray()]);
      object.progress = blob.size / length;
      range.end += ContentLength
      if (onChange) {
        onChange();
      }
    }
    console.log("Download completed", blob.size, "bytes");
    return blob;
  }

  const uploadManaged = async (bucket: string,
    fileObject: FileObjectWithProgress, onChange?: () => void) => {
    const upload = new Upload({
      client: client,
      params: {
        Bucket: bucket,
        Key: fileObject.object.Key,
        Body: fileObject.file
      }
    });
    upload.on("httpUploadProgress", (progress) => {
      if (onChange) {
        let { loaded, total } = progress;
        loaded = loaded ?? 0;
        total = total ?? 1;
        fileObject.setProgress(loaded / total);
        onChange();
      }
    })
    return upload.done();
  }

  const getBucketVersioning = async (bucket: string): Promise<GetBucketVersioningCommandOutput> => {
    const getBucketVersioningCommand = new GetBucketVersioningCommand({
      Bucket: bucket
    });
    return await client.send(getBucketVersioningCommand);
  };

  const setBucketVersioning = async (bucket: string, enabled: boolean) => {
    const versioningConfiguration: VersioningConfiguration = {
      Status: enabled ? "Enabled" : "Disabled"
    };
    const putVersioningCommand = new PutBucketVersioningCommand({
      Bucket: bucket,
      VersioningConfiguration: versioningConfiguration
    });
    return await client.send(putVersioningCommand);
  }

  const getBucketObjectLock = async (bucket: string) => {
    const cmd = new GetObjectLockConfigurationCommand({ Bucket: bucket });
    return await client.send(cmd);
  }

  const setBucketObjectLock = async (bucket: string, enabled: boolean) => {
    const configuration = { ObjectLockEnabled: enabled ? "Enabled" : "Disabled" };
    const cmd = new PutObjectLockConfigurationCommand({
      Bucket: bucket,
      ObjectLockConfiguration: configuration
    });
    return await client.send(cmd);
  }

  const downloadObject = downloadInChunks;
  const uploadObject = uploadManaged;

  return (
    <S3Context.Provider
      value={{
        ...state,
        loginWithSTS,
        loginWithCredentials,
        logout,
        fetchBucketList,
        getPresignedUrl,
        createBucket,
        deleteBucket,
        listObjects,
        downloadObject,
        uploadObject,
        getBucketVersioning,
        setBucketVersioning,
        getBucketObjectLock,
        setBucketObjectLock
      }}
    >
      {children}
    </S3Context.Provider>
  )
};
