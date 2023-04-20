import { createContext } from "react";
import { Bucket } from "@aws-sdk/client-s3";

export const BucketsListContext = createContext<Bucket[]>([]);
