import { createContext } from "react";
import { BucketInfo } from "../models/bucket";

export const BucketsListContext = createContext<BucketInfo[]>([]);
