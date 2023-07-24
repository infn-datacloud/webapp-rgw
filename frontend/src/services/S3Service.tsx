import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { useOAuth } from "./OAuth2";
import { STSClient, AssumeRoleWithWebIdentityCommand } from "@aws-sdk/client-sts";
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
  GetObjectLockConfigurationCommandOutput,
} from "@aws-sdk/client-s3";
import { AwsCredentialIdentity } from "@aws-sdk/types";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { OidcToken } from "./OAuth2/OidcConfig";
import { useNotifications, NotificationType } from "./Notification";

const ONE_MB = 1024 * 1024;

// **** AWS Config ****
export interface AWSConfig {
  endpoint: string;
  region: string;
}

// ***** State *****

export interface IS3ServiceState {
  awsCredentials?: AwsCredentialIdentity;
}


export const initialS3ServiceState: IS3ServiceState = {
  awsCredentials: undefined,
}

// ***** Context *****
export interface CreateBucketArgs {
  bucketName: string;
  versioningEnabled: boolean;
  objectLockEnabled: boolean;
};

export interface S3ContextProps {
  awsConfig: AWSConfig;
  client: S3Client;
  isAuthenticated: boolean;
  fetchBucketList: () => Promise<Bucket[]>;
  listObjects: (bucket: Bucket) => Promise<_Object[]>;
  getPresignedUrl: (bucket: string, key: string) => Promise<string>;
  createBucket: (args: CreateBucketArgs) => Promise<any>;
  deleteBucket: (bucket: string) => Promise<any>;
  downloadObject: (bucket: string, key: string) => Promise<Blob>;
  getBucketVersioning: (bucket: string) => Promise<GetBucketVersioningCommandOutput>;
  setBucketVersioning: (bucket: string, enabled: boolean) => Promise<any>;
  getBucketObjectLock: (bucket: string) => Promise<GetObjectLockConfigurationCommandOutput>;
  setBucketObjectLock: (bucket: string, enabled: boolean) => Promise<any>;
}

export const S3ServiceContext = createContext<S3ContextProps | undefined>(undefined);

// ***** S3Service *****

interface S3ServiceProviderProps {
  awsConfig: AWSConfig;
}

const CreateS3ServiceProvider = (props: S3ServiceProviderProps) => {
  const { awsConfig } = props;
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [client, setClient] = useState<S3Client>(new S3Client({}));
  const oAuth = useOAuth();
  const { notify } = useNotifications();


  // Exchange token for AWS Credentiasl with AssumeRoleWebIdendity
  const getAWSCretentials = useCallback((token: OidcToken) => {
    console.log("Get AWS Credentials from STS");
    const sts = new STSClient({ ...awsConfig });
    const command = new AssumeRoleWithWebIdentityCommand({
      DurationSeconds: 3600,
      RoleArn: "arn:aws:iam:::role/S3AccessIAM200",
      RoleSessionName: "ceph-frontend-poc", // TODO: change me
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
        } else {
          console.warn("Warning: some one or more AWS Credentials member is empty");
        }
      }).catch((err: Error) => {
        notify("Cannot retrieve AWS Credentials from STS", err.name, NotificationType.error);
        setIsAuthenticated(false);
      });
  }, [awsConfig, notify]);

  useEffect(() => {
    oAuth.subscribe(getAWSCretentials);
    return () => {
      oAuth.unsubscribe(getAWSCretentials);
    }
  }, [oAuth, getAWSCretentials]);


  const fetchBucketList = async () => {
    const listBucketCmd = new ListBucketsCommand({});
    let response = await client.send(listBucketCmd)
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
    const cmd = new ListObjectsV2Command({ Bucket: bucket.Name });
    const response = await client.send(cmd);
    const { Contents } = response;
    if (Contents) {
      return Contents;
    } else {
      console.warn(`Warning: bucket ${bucket.Name} has no content`);
      return [];
    }
  };

  const getPresignedUrl = async (bucket: string, key: string) => {
    const cmdGetObj = new GetObjectCommand({
      Bucket: bucket,
      Key: key,
      ResponseContentDisposition: `attachment; filename="${key}"`,
      ResponseContentType: "application/octet-stream"
    });
    return getSignedUrl(client, cmdGetObj, {expiresIn: 60});
  };


  const getObjectRange = (bucket: string, key: string, start: number, end: number) => {
    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: key,
      Range: `bytes=${start}-${end}`
    });
    return client.send(command);
  };

  const getRangeAndLength = (contentRange: string) => {
    const [range, length] = contentRange.split("/");
    const [start, end] = range.split("-");
    return {
      start: parseInt(start),
      end: parseInt(end),
      length: parseInt(length)
    };
  };

  interface DownloadLengthRange {
    start: number;
    end: number;
    length: number;
  }

  const getBucketVersioning = async (bucket: string): Promise<GetBucketVersioningCommandOutput> => {
    const getBucketVersioningCommand = new GetBucketVersioningCommand({
      Bucket: bucket
    });
    return await client.send(getBucketVersioningCommand);
  };

  const isDownloadComplete = ({ end, length }: DownloadLengthRange) => {
    return end === length - 1;
  }

  const downloadInChunks = async (bucket: string, key: string) => {
    let blob = new Blob();
    let rangeAndLength: DownloadLengthRange = { start: - 1, end: -1, length: -1 };

    while (!isDownloadComplete(rangeAndLength)) {
      const { end } = rangeAndLength;
      const nextRange = { start: end + 1, end: end + ONE_MB };
      console.log(`Downloading bytes ${nextRange.start} to ${nextRange.end}`);

      const { ContentRange, Body } = await getObjectRange(bucket, key,
        nextRange.start, nextRange.end);
      if (!(ContentRange && Body)) {
        break;
      }
      blob = new Blob([blob, await Body.transformToByteArray()]);
      rangeAndLength = getRangeAndLength(ContentRange);
    }

    console.log("Download completed");
    return blob;
  }

  const setBucketVersioning = async (bucket: string, enabled: boolean) => {
    // const client = getS3Client();
    const versioningConfigutaion: VersioningConfiguration = {
      Status: enabled ? "Enabled" : "Disabled"
    };
    const putVersioningCommand = new PutBucketVersioningCommand({
      Bucket: bucket,
      VersioningConfiguration: versioningConfigutaion
    });
    return await client.send(putVersioningCommand);
  }

  const getBucketObjectLock = async (bucket: string) => {
    const cmd = new GetObjectLockConfigurationCommand({ Bucket: bucket });
    return await client.send(cmd);
  }

  const setBucketObjectLock = async (bucket: string, enabled: boolean) => {
    // const client = getS3Client();
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
    isAuthenticated: isAuthenticated,
    fetchBucketList: () => fetchBucketList(),
    listObjects: (bucket: Bucket) => listObjects(bucket),
    getPresignedUrl: getPresignedUrl,
    createBucket: (args: CreateBucketArgs) => createBucket(args),
    deleteBucket: (bucket: string) => deleteBucket(bucket),
    downloadObject: downloadInChunks,
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
      "as a child of <S3ServicePrivder> component."
    );
  }
  return context;
}

export function withS3(WrappedComponent: React.FunctionComponent, s3Config: S3ServiceProviderProps) {
  return function (props: any) {
    const serviceProvider = CreateS3ServiceProvider(s3Config);
    return (
      <S3ServiceContext.Provider value={serviceProvider}>
        <WrappedComponent {...props} />;
      </S3ServiceContext.Provider>
    );
  };
};