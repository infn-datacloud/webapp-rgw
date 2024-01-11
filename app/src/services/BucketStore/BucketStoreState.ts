import type { Bucket, _Object } from "@aws-sdk/client-s3/dist-types/models";
import { BucketInfo } from "../../models/bucket";

export interface BucketStoreState {
  buckets: Bucket[];
  bucketsInfos: BucketInfo[];
  objects: Map<string, _Object[]>;
}

export const initialState: BucketStoreState = {
  buckets: [],
  bucketsInfos: [],
  objects: new Map(),
};
