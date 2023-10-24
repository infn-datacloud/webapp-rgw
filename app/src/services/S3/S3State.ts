import { S3Client } from "@aws-sdk/client-s3";

export interface S3State {
	isLoading: boolean;
	isAuthenticated: boolean;
	client: S3Client;
}

export const initialAuthState: S3State = {
	isLoading: true,
	isAuthenticated: false,
	client: new S3Client({})
}
