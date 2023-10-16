export interface AWSConfig {
  endpoint: string;
  region: string;
  roleArn: string;
  roleSessionDurationSeconds: number;
}

export interface CreateBucketArgs {
  bucketName: string;
  versioningEnabled: boolean;
  objectLockEnabled: boolean;
}


export interface S3ServiceProviderProps {
  awsConfig: AWSConfig;
}
