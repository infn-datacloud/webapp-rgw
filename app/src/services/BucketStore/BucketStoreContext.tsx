import { createContext } from "react";
import { BucketStoreState } from "./BucketStoreState";

export interface BucketStoreContextProps extends BucketStoreState {
  updateStore: () => void;
  reset: () => void;
}

export const BucketStoreContext =
  createContext<BucketStoreContextProps | undefined>(undefined);
