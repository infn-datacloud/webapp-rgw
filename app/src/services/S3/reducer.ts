import { S3Client } from "@aws-sdk/client-s3";
import { S3State } from "./S3State";

type Action =
	| { type: "LOGGING_IN" }
	| { type: "LOGGED_IN"; client: S3Client }
	| { type: "LOGGED_OUT" };

export const reducer = (state: S3State, action: Action): S3State => {
	switch (action.type) {
		case "LOGGED_IN":
			return {
				...state,
				client: action.client,
				isAuthenticated: true,
				isLoading: false
			};
		case "LOGGED_OUT":
			return {
				...state,
				client: new S3Client({}),
				isAuthenticated: false,
				isLoading: false
			};
		case "LOGGING_IN":
			return {
				...state,
				isAuthenticated: false,
				isLoading: true
			}
		default:
			return {
				...state,
				client: new S3Client({}),
				isAuthenticated: false,
				isLoading: false
			}
	}
}