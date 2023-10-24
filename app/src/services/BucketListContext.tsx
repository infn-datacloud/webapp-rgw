import { Dispatch, SetStateAction, createContext } from "react";
import { Bucket } from "@aws-sdk/client-s3";

interface BucketListContextProps {
  bucketList: Bucket[]
  setBuckets: Dispatch<SetStateAction<Bucket[]>>
}

export const BucketListContext = createContext<BucketListContextProps>({
  bucketList: [],
  setBuckets: function () { }
});
