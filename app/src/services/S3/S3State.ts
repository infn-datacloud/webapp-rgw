import { Bucket, S3Client, S3ClientConfig } from "@aws-sdk/client-s3";

export interface S3Cache {
  clientConfiguration: S3ClientConfig;
  externalBuckets: Bucket[];
}

export interface S3State {
  isLoading: boolean;
  isAuthenticated: boolean;
  client: S3Client;
  externalBuckets: Bucket[];
}

export const initialAuthState: S3State = {
  isLoading: true,
  isAuthenticated: false,
  client: new S3Client({}),
  externalBuckets: [],
};
