import { ReactNode, createContext, useContext, useState } from "react";
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
} from "@aws-sdk/client-s3";
import { AwsCredentialIdentity } from "@aws-sdk/types";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { useCallback } from "react";
import { useEffect } from "react";
import { OidcToken } from "./OAuth2/OidcConfig";


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
  versioningConfigutaion: VersioningConfiguration | undefined;
  objectLockingEnabled: boolean
};

export interface S3ContextProps {
  awsConfig: AWSConfig;
  client: S3Client;
  isAuthenticated: () => boolean;
  fetchBucketList: () => Promise<Bucket[]>;
  listObjects: (bucket: Bucket) => Promise<_Object[]>;
  getPresignedUrl: (bucket: string, key: string) => Promise<any>;
  createBucket: (args: CreateBucketArgs) => Promise<any>;
  deleteBucket: (bucket: string) => Promise<any>;
}

export const S3ServiceContext = createContext<S3ContextProps | undefined>(undefined);

// ***** S3Service *****

interface S3ServiceProviderProps {
  awsConfig: AWSConfig;
  children?: ReactNode;
}

export const S3ServiceProvider = (props: S3ServiceProviderProps): JSX.Element => {
  const { children, awsConfig } = props;
  const [
    s3ServiceState,
    setS3ServiceState
  ] = useState<IS3ServiceState>(initialS3ServiceState);

  const oAuth = useOAuth();
  const { awsCredentials } = s3ServiceState;

  // Factory method
  const getS3Client = useCallback(() => {
    const { endpoint, region } = awsConfig;
    return new S3Client({
      endpoint: endpoint,
      region: region,
      credentials: awsCredentials,
      forcePathStyle: true
    });
  }, [awsCredentials, awsConfig]);

  const isAuthenticated = () => {
    return oAuth.isAuthenticated && !!awsCredentials;
  }

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
          setS3ServiceState({
            awsCredentials: {
              accessKeyId: AccessKeyId,
              secretAccessKey: SecretAccessKey,
              sessionToken: SessionToken
            }
          });
        } else {
          console.warn("Warning: some one or more AWS Credentials member is empty");
        }
      }).catch(err => {
        console.error("Cannot retrieve AWS Credentials from STS", err);
      });
  }, [awsConfig]);

  useEffect(() => {
    oAuth.subscribe(getAWSCretentials);
    return () => {
      oAuth.unsubscribe(getAWSCretentials);
    }
  }, [oAuth, getAWSCretentials]);


  const fetchBucketList = async () => {
    const listBucketCmd = new ListBucketsCommand({});
    const client = getS3Client();
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
    const { bucketName, objectLockingEnabled, versioningConfigutaion } = args;
    const createBucketCommand = new CreateBucketCommand({
      Bucket: bucketName,
      ObjectLockEnabledForBucket: objectLockingEnabled,
    });
    const client = getS3Client();
    const result = await client.send(createBucketCommand);

    if (versioningConfigutaion) {
      const putVersioningCommand = new PutBucketVersioningCommand({
        Bucket: bucketName,
        VersioningConfiguration: versioningConfigutaion
      });
      await client.send(putVersioningCommand);
      const getBucketVersioningCommand = new GetBucketVersioningCommand({
        Bucket: bucketName
      });
      const result = await client.send(getBucketVersioningCommand);
      console.log("Versioning", result.Status);
    }

    return result;
  };

  const deleteBucket = async (bucket: string) => {
    const cmd = new DeleteBucketCommand({ Bucket: bucket });
    const client = getS3Client();
    return await client.send(cmd);
  };

  const listObjects = async (bucket: Bucket): Promise<_Object[]> => {
    const cmd = new ListObjectsV2Command({ Bucket: bucket.Name });
    const client = getS3Client();
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
    const cmdGetObj = new GetObjectCommand({ Bucket: bucket, Key: key });
    const client = getS3Client();
    return getSignedUrl(client, cmdGetObj);
  };

  return (
    <S3ServiceContext.Provider value={{
      awsConfig: awsConfig,
      client: getS3Client(),
      isAuthenticated: () => isAuthenticated(),
      fetchBucketList: () => fetchBucketList(),
      listObjects: (bucket: Bucket) => listObjects(bucket),
      getPresignedUrl: getPresignedUrl,
      createBucket: (args: CreateBucketArgs) => createBucket(args),
      deleteBucket: (bucket: string) => deleteBucket(bucket)
    }}>
      {children}
    </S3ServiceContext.Provider>
  );
};

// **** useS3Service *****

export const useS3Service = (): S3ContextProps => {
  const context = useContext(S3ServiceContext);
  if (!context) {
    throw new Error(
      "S3ServiceProvider context is undefined, " +
      "please verify you are calling useS3Service " +
      "as a child of <S3ServicePrivder> comonent."
    );
  }
  return context;
}