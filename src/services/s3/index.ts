import {
  AssumeRoleWithWebIdentityCommand,
  STSClient,
} from "@aws-sdk/client-sts";
import { AWSConfig } from "./types";

const awsConfig: AWSConfig = {
  endpoint: process.env.S3_ENDPOINT!,
  region: process.env.S3_REGION!,
  roleArn: process.env.S3_ROLE_ARN!,
  roleSessionDurationSeconds: parseInt(process.env.S3_ROLE_DURATION_SECONDS!),
};

export async function loginWithSTS(access_token: string) {
  const sts = new STSClient({ ...awsConfig });
  const command = new AssumeRoleWithWebIdentityCommand({
    DurationSeconds: awsConfig.roleSessionDurationSeconds,
    RoleArn: awsConfig.roleArn,
    RoleSessionName: crypto.randomUUID(),
    WebIdentityToken: access_token,
  });
  const { Credentials } = await sts.send(command);
  return Credentials;
}
