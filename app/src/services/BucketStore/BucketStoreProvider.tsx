import { Bucket, _Object } from "@aws-sdk/client-s3";
import { useEffect, useRef, useReducer } from "react";
import { BucketStoreContext } from "./BucketStoreContext";
import { BucketInfo } from "../../models/bucket";
import { useS3 } from "../S3";
import { reducer } from "./reducer";
import { initialState } from "./BucketStoreState";
import { NotificationType, useNotifications } from "../Notifications";
import { camelToWords } from "../../commons/utils";

interface BucketStoreProviderBaseProps {
  children?: React.ReactNode;
}

export interface BucketStoreProviderProps extends BucketStoreProviderBaseProps { }

export const BucketStoreProvider = (props: BucketStoreProviderProps): JSX.Element => {
  const { children } = props;
  const { isAuthenticated, fetchBucketList, listObjects } = useS3();
  const [state, dispatch] = useReducer(reducer, initialState);
  const { notify } = useNotifications();

  /** Return the list of owned buckets. */
  const fetchBuckets = async (): Promise<Bucket[]> => {
    console.debug("Fetching bucket list");
    try {
      return await fetchBucketList();
    } catch (err) {
      if (err instanceof Error) {
        notify("Cannot create Bucket", camelToWords(err.name),
          NotificationType.error)
      } else {
        console.error(err);
      }
    }
    return [];
  };

  /** Compute Bucket Summary Info, counting all objects and summing their size */
  const computeBucketSummary = async (bucket: Bucket, objects: _Object[]) => {
    const info: BucketInfo = {
      name: bucket.Name ?? "N/A",
      creation_date: bucket.CreationDate?.toString() ?? "N/A",
      rw_access: { read: true, write: true },
      objects: 0,
      size: 0
    }
    if (objects) {
      objects.forEach(o => {
        ++info.objects;
        info.size += o.Size ?? 0.0;
      });
    }
    return info;
  };

  /** Fetch buckets list, objects lists and bucket infos */
  const updateStore = async () => {
    try {
      const r = await listObjects({ Name: "cygno-scratch" });
      console.log(r);
    } catch (err) {
      if (err instanceof Error)
        notify(err.name, err.message)
    }
    const objects = new Map<string, _Object[]>();
    const buckets = await fetchBuckets();
    const listObjectsPromises = buckets.map(bucket => listObjects(bucket));
    const bucketsInfosPromises = listObjectsPromises
      .map(async (promise, index) => {
        const bucket = buckets[index];
        const name = bucket.Name!;
        const objectList = await Promise.resolve(promise);
        objects.set(name, objectList);
        return computeBucketSummary(bucket, objectList);
      });
    const bucketsInfos = await Promise.all(bucketsInfosPromises);
    dispatch({ buckets, objects, bucketsInfos })
  }

  const fetchBucketLock = useRef<boolean>(false);
  useEffect(() => {
    if (isAuthenticated && !fetchBucketLock.current) {
      updateStore();
      fetchBucketLock.current = true;
    }
  });

  /** Empty the store */
  const reset = () => {
    dispatch(initialState);
    fetchBucketLock.current = false;
  }

  return (
    <BucketStoreContext.Provider
      value={{
        ...state,
        updateStore,
        reset
      }}
    >
      {children}
    </BucketStoreContext.Provider>
  )
}
