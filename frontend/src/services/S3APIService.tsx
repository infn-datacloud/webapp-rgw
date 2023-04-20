import { ReactNode, createContext, useContext, useState } from "react";
import { useOAuth } from "./OAuth2";
import { STSClient, AssumeRoleWithWebIdentityCommand } from "@aws-sdk/client-sts";
import { S3Client } from "@aws-sdk/client-s3";
import { AwsCredentialIdentity } from "@aws-sdk/types";
import { useCallback } from "react";
import { useEffect } from "react";
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

export interface S3ContextProps {
  awsConfig: AWSConfig;
  client: S3Client;
  isAuthenticated: () => boolean;
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
    return new S3Client({
      endpoint: awsConfig.endpoint,
      region: awsConfig.region,
      credentials: awsCredentials,
      forcePathStyle: true
    });
  }, [awsCredentials, awsConfig.endpoint]);


  const isAuthenticated = () => {
    return oAuth.isAuthenticated && !!awsCredentials;
  }


  // Exchange token for AWS Credentiasl with AssumeRoleWebIdendity
  useEffect(() => {
    const token = oAuth.user?.token;

    if (!(oAuth.isAuthenticated && token)) {
      console.log("Token missig or expired");
      return;
    }

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
  }, [awsConfig, oAuth.isAuthenticated, oAuth.user]);


  return (
    <S3ServiceContext.Provider value={{
      awsConfig: awsConfig,
      client: getS3Client(),
      isAuthenticated: () => isAuthenticated()
    }}>
      {children}
    </S3ServiceContext.Provider>
  );
}

// **** useS3Service *****

export const useS3Service = (): S3ContextProps => {
  const context = useContext(S3ServiceContext);
  if (!context) {
    throw new Error(
      "S3ServiceProvider context is undefined, \
      please verify you are calling useS3Service as a child of \
      <S3ServicePrivder> comonent."
    );
  }
  return context;
}