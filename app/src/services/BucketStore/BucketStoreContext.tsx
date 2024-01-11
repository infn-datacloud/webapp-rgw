import { createContext } from "react";
import { BucketStoreState } from "./BucketStoreState";
import { Bucket } from "@aws-sdk/client-s3";

export interface BucketStoreContextProps extends BucketStoreState {
  updateStore: () => void;
  mountBucket: (bucket: Bucket) => Promise<boolean>;
  unmountBucket: (bucket: Bucket) => void;
  reset: () => void;
}

export const BucketStoreContext = createContext<
  BucketStoreContextProps | undefined
>(undefined);
