import { createContext } from "react";
import { S3State } from "./S3State";
import type { CreateBucketArgs } from ".";
import type {
	S3Client,
	Bucket,
	_Object,
	CreateBucketCommandOutput,
	DeleteBucketCommandOutput,
	GetBucketVersioningCommandOutput,
	PutBucketVersioningCommandOutput,
	GetObjectLockConfigurationCommandOutput,
	PutObjectLockConfigurationCommandOutput
} from "@aws-sdk/client-s3";
import type { AwsCredentialIdentity } from "@aws-sdk/types";
import type { BucketObjectWithProgress, FileObjectWithProgress } from "../../models/bucket";
import type { User } from "../OAuth";

export interface S3ContextProps extends S3State {
	client: S3Client;
	loginWithSTS: (user: User) => Promise<void>;
	loginWithCredentials: (credentials: AwsCredentialIdentity) => void;
	logout: () => void;
	fetchBucketList: () => Promise<Bucket[]>;
	listObjects: (bucket: Bucket) => Promise<_Object[]>;
	getPresignedUrl: (bucket: string, key: string) => Promise<string>;
	createBucket: (args: CreateBucketArgs) => Promise<CreateBucketCommandOutput>;
	deleteBucket: (bucket: string) => Promise<DeleteBucketCommandOutput>;
	downloadObject: (bucket: string, object: BucketObjectWithProgress, onChange?: () => void) => Promise<Blob>;
  uploadObject: (bucket: string, object: FileObjectWithProgress, onChange?: () => void) => void;
  deleteObject: (bucket: string, key: string) => void;
	getBucketVersioning: (bucket: string) => Promise<GetBucketVersioningCommandOutput>;
	setBucketVersioning: (bucket: string, enabled: boolean) => Promise<PutBucketVersioningCommandOutput>;
	getBucketObjectLock: (bucket: string) => Promise<GetObjectLockConfigurationCommandOutput>;
	setBucketObjectLock: (bucket: string, enabled: boolean) => Promise<PutObjectLockConfigurationCommandOutput>;
}

export const S3Context = createContext<S3ContextProps | undefined>(undefined);
