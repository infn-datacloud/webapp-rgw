import { ReactNode, createContext, useContext, useState } from "react";
import { useOAuth } from "./OAuth2";
import STS from "aws-sdk/clients/sts";
import S3 from "aws-sdk/clients/s3";
import { Credentials } from "aws-sdk";
import { useCallback } from "react";
import { useEffect } from "react";
import { AWSError, Endpoint } from "aws-sdk";

// **** AWS Config ****
export interface AWSConfig {
  endpoint: string | Endpoint;
  region: string;
}

// ***** State *****

export interface IS3ServiceState {
  awsCredentials?: Credentials;
}


export const initialS3ServiceState: IS3ServiceState = {
  awsCredentials: undefined
}

// ***** Context *****

export interface S3ContextProps {
  awsConfig: AWSConfig;
  listBuckets(): void;
  createBucket(bucketName: string): void;
}

export const S3ServiceContext = createContext<S3ContextProps | undefined>(undefined);

// ***** S3Service *****

interface S3ServiceProviderProps {
  awsConfig: AWSConfig;
  children?: ReactNode;
}

export const S3ServiceProvider = (props: S3ServiceProviderProps): JSX.Element => {
  const { children, awsConfig } = props;

  const [s3ServiceState, setS3ServiceState] = useState<IS3ServiceState>(
    initialS3ServiceState
  );
  const oAuth = useOAuth();

  const isAuthenticated = () => {
    return oAuth.isAuthenticated && !oAuth.user?.token?.expired;
  }

  const getS3Client = (): S3 => {
    return new S3({
      endpoint: awsConfig.endpoint,
      region: "",
      credentials: s3ServiceState.awsCredentials,
      s3ForcePathStyle: true
    });
  }


  useEffect(() => {
    if (!oAuth.isAuthenticated) {
      return;
    }

    const user = oAuth.user!;
    const token = user.token;

    if (!token) {
      console.log("Token missig or expired");
      return;
    }

    const sts = new STS({
      endpoint: awsConfig.endpoint,
      region: awsConfig.region
    });

    sts.assumeRoleWithWebIdentity(
      {
        DurationSeconds: 3600,
        RoleArn: "arn:aws:iam:::role/S3AccessIAM200",
        RoleSessionName: "ceph-frontend-poc", // TODO: change me
        WebIdentityToken: token.access_token,
      }, (err: AWSError, data) => {
        if (err) {
          throw new Error(err.message);
        }

        const stsCredentials = data.Credentials;
        if (!stsCredentials) {
          throw new Error("Cannot retrieve AWS Credentials from STS");
        }

        setS3ServiceState({
          awsCredentials: new Credentials({
            accessKeyId: stsCredentials.AccessKeyId,
            secretAccessKey: stsCredentials.SecretAccessKey,
            sessionToken: stsCredentials.SessionToken,
          })
        });
      }
    )
  }, [oAuth.isAuthenticated]);


  const listBuckets = useCallback(() => {
    if (!s3ServiceState.awsCredentials) {
      console.warn("No AWS credentials");
      return;
    }
    const s3 = getS3Client();
    s3.listBuckets((err, data) => {
      if (err) {
        throw new Error(err.message);
      }
      console.log(data);
    })
  }, [s3ServiceState.awsCredentials]);

  const createBucket = useCallback((bucketName: string) => {
    const s3 = getS3Client();
    s3.createBucket({
      Bucket: bucketName,
      CreateBucketConfiguration: {
        LocationConstraint: ""
      }
    }, ((err, data) => {
      if (err) {
        throw new Error(err.name + " " + err.message);
      }
      console.log(data);
    }));
  }, [s3ServiceState.awsCredentials])

  return (
    <S3ServiceContext.Provider value={{
      awsConfig: awsConfig,
      listBuckets: listBuckets,
      createBucket: createBucket
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