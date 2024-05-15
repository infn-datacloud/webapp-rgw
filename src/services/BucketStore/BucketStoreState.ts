import type { _Object } from "@aws-sdk/client-s3/dist-types/models";
import { BucketInfo } from "../../models/bucket";

export interface BucketStoreState {
  bucketsInfos: BucketInfo[];
  objects: Map<string, _Object[]>;
}

export const initialState: BucketStoreState = {
  bucketsInfos: [],
  objects: new Map(),
};
