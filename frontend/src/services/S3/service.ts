import { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import { AWSConfig, CreateBucketArgs, S3ServiceProviderProps } from "./types";
import { useOAuth } from "../OAuth2";
import { STSClient, AssumeRoleWithWebIdentityCommand } from "@aws-sdk/client-sts";
import {
  Bucket,
  ListBucketsCommand,
  GetObjectCommand,
  S3Client,
  ListObjectsV2Command,
  _Object,
  CreateBucketCommand,
  CreateBucketCommandOutput,
  PutBucketVersioningCommand,
  PutBucketVersioningCommandOutput,
  GetBucketVersioningCommand,
  VersioningConfiguration,
  DeleteBucketCommand,
  DeleteBucketCommandOutput,
  GetBucketVersioningCommandOutput,
  GetObjectLockConfigurationCommand,
  GetObjectLockConfigurationCommandOutput,
  PutObjectLockConfigurationCommand,
  PutObjectLockConfigurationCommandOutput,
  ListObjectsV2CommandOutput,
} from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { OidcToken } from "../OAuth2/OidcConfig";
import { useNotifications, NotificationType } from "../Notification";
import { BucketObjectWithProgress, FileObjectWithProgress } from "../../models/bucket";
import { camelToWords } from "../../commons/utils";
import { AwsCredentialIdentity } from "@aws-sdk/types";

const ONE_MB = 1024 * 1024;

export interface S3ContextProps {
  awsConfig: AWSConfig;
  client: S3Client;
  isAuthenticated: boolean;
  loginWithCredentials: (credentials: AwsCredentialIdentity) => void;
  logout: () => void;
  fetchBucketList: () => Promise<Bucket[]>;
  listObjects: (bucket: Bucket) => Promise<_Object[]>;
  getPresignedUrl: (bucket: string, key: string) => Promise<string>;
  createBucket: (args: CreateBucketArgs) => Promise<CreateBucketCommandOutput>;
  deleteBucket: (bucket: string) => Promise<DeleteBucketCommandOutput>;
  downloadObject: (bucket: string, object: BucketObjectWithProgress, onChange?: () => void) => Promise<Blob>;
  uploadObject: (bucket: string, object: FileObjectWithProgress, onChange?: () => void) => void;
  getBucketVersioning: (bucket: string) => Promise<GetBucketVersioningCommandOutput>;
  setBucketVersioning: (bucket: string, enabled: boolean) => Promise<PutBucketVersioningCommandOutput>;
  getBucketObjectLock: (bucket: string) => Promise<GetObjectLockConfigurationCommandOutput>;
  setBucketObjectLock: (bucket: string, enabled: boolean) => Promise<PutObjectLockConfigurationCommandOutput>;
}

export const S3ServiceContext = createContext<S3ContextProps | undefined>(undefined);

// ***** S3Service *****

export const CreateS3ServiceProvider = (props: S3ServiceProviderProps) => {
  const { awsConfig } = props;
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [client, setClient] = useState<S3Client>(new S3Client({}));
  const authRef = useRef<boolean>(false);
  const oAuth = useOAuth();
  const { notify } = useNotifications();

  authRef.current = isAuthenticated;

  // Exchange token for AWS Credentials with AssumeRoleWebIdentity
  const getAWSCredentials = useCallback((token: OidcToken) => {
    console.log("Get AWS Credentials from STS");
    const sts = new STSClient({ ...awsConfig });
    const command = new AssumeRoleWithWebIdentityCommand({
      DurationSeconds: awsConfig.roleSessionDurationSeconds,
      RoleArn: awsConfig.roleArn,
      RoleSessionName: crypto.randomUUID(),
      WebIdentityToken: token.access_token,
    });

    sts.send(command)
      .then(response => {
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
          setClient(new S3Client({
            endpoint: endpoint,
            region: region,
            credentials: awsCredentials,
            forcePathStyle: true
          }));
          setIsAuthenticated(true);
          console.log("Authenticated via STS");
          authRef.current = true;
        } else {
          console.warn("Warning: some one or more AWS Credentials member is empty");
        }
      }).catch((err: Error) => {
        notify("Cannot retrieve AWS Credentials from STS",
          camelToWords(err.name), NotificationType.error);
        setIsAuthenticated(false);
        authRef.current = false;
        oAuth.logout();
      });
  }, [awsConfig, oAuth, notify]);

  const loginWithCredentials = async (credentials: AwsCredentialIdentity) => {
    const { endpoint, region } = awsConfig;
    const client = new S3Client({
      endpoint: endpoint,
      region: region,
      credentials: credentials,
      forcePathStyle: true
    });
    try {
      await client.send(new ListBucketsCommand({}));
      setClient(client);
      authRef.current = true;
    } catch (err) {
      authRef.current = false;
      if (err instanceof Error) {
        notify("Access failed", camelToWords(err.name), NotificationType.error);
      }
    }
    setIsAuthenticated(authRef.current);
  }

  const logout = () => {
    authRef.current = false;
    setIsAuthenticated(authRef.current);
  }

  useEffect(() => {
    oAuth.subscribe(getAWSCredentials);
    return () => {
      oAuth.unsubscribe(getAWSCredentials);
    }
  }, [oAuth, getAWSCredentials]);


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
    const content: _Object[] = []
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
        content.concat(Contents);
        if (IsTruncated) {
          continuationToken = NextContinuationToken;
        } else {
          completed = true;
        }
      } else {
        notify(`Warning: bucket ${bucket.Name} has no content`, "",
          NotificationType.warning);
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

  return {
    awsConfig: awsConfig,
    client: client,
    isAuthenticated: authRef.current,
    loginWithCredentials: loginWithCredentials,
    logout: () => logout(),
    fetchBucketList: () => fetchBucketList(),
    listObjects: (bucket: Bucket) => listObjects(bucket),
    getPresignedUrl: getPresignedUrl,
    createBucket: (args: CreateBucketArgs) => createBucket(args),
    deleteBucket: (bucket: string) => deleteBucket(bucket),
    downloadObject: downloadInChunks,
    uploadObject: uploadManaged,
    getBucketVersioning: (bucket: string) => getBucketVersioning(bucket),
    setBucketVersioning: (bucket: string, enabled: boolean) => setBucketVersioning(bucket, enabled),
    getBucketObjectLock: (bucket: string) => getBucketObjectLock(bucket),
    setBucketObjectLock: (bucket: string, enabled: boolean) => setBucketObjectLock(bucket, enabled)
  };
};

// **** useS3Service *****

export const useS3Service = (): S3ContextProps => {
  const context = useContext(S3ServiceContext);
  if (!context) {
    throw new Error(
      "S3ServiceProvider context is undefined, " +
      "please verify you are calling useS3Service " +
      "as a child of <S3ServiceProvider> component."
    );
  }
  return context;
}
