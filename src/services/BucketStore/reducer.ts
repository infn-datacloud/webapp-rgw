import { BucketStoreState } from "./BucketStoreState";

export const reducer = (
  oldState: BucketStoreState,
  newState: BucketStoreState
) => {
  return { ...oldState, ...newState };
};
