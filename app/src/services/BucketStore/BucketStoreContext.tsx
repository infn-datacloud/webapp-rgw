import { Bucket } from "@aws-sdk/client-s3";
import { BucketInfo } from "../../models/bucket";
import { createContext } from "react";

export interface BucketStoreContextProps {
	bucketList: Bucket[];
	bucketsInfos: BucketInfo[];
	updateStore: () => void;
	reset: () => void;
}

const defaultBucketStore: BucketStoreContextProps = {
	bucketList: [],
	bucketsInfos: [],
	updateStore: function () { },
	reset: function () { }
};

export const BucketStoreContext = createContext<BucketStoreContextProps>(defaultBucketStore);
