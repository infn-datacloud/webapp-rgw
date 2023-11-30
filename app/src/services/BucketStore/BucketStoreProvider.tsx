import { Bucket, _Object } from "@aws-sdk/client-s3";
import { useEffect, useReducer, useState, useCallback, useRef } from "react";
import { BucketStoreContext } from "./BucketStoreContext";
import { BucketInfo } from "../../models/bucket";
import { useS3 } from "../S3";
import { reducer } from "./reducer";
import { initialState } from "./BucketStoreState";

interface BucketStoreProviderBaseProps {
  children?: React.ReactNode;
}

export interface BucketStoreProviderProps extends BucketStoreProviderBaseProps { }

export const BucketStoreProvider = (props: BucketStoreProviderProps): JSX.Element => {
  const { children } = props;
  const { isAuthenticated, fetchBucketList, headBucket, listObjects } = useS3();
  const [state, dispatch] = useReducer(reducer, initialState);
  const [externalBuckets, setExternalBuckets] = useState<Bucket[]>([]);
  const componentDidMount = useRef(false);

  /** Compute Bucket Summary Info, counting all objects and summing their size */
  const computeBucketSummary = async (bucket: Bucket, objects: _Object[],
    external: boolean) => {
    const info: BucketInfo = {
      name: bucket.Name ?? "N/A",
      creation_date: bucket.CreationDate?.toString() ?? "N/A",
      rw_access: { read: true, write: true },
      objects: 0,
      size: 0,
      external: external
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
  const updateStore = useCallback(async () => {
    console.log("Update store");
    const objects = new Map<string, _Object[]>();
    const ownedBuckets = await fetchBucketList()
    const buckets = externalBuckets.concat(ownedBuckets);
    const listObjectsPromises = buckets.map(bucket => listObjects(bucket));
    const bucketsInfosPromises = listObjectsPromises
      .map(async (promise, index) => {
        const bucket = buckets[index];
        const name = bucket.Name!;
        const objectList = await Promise.resolve(promise);
        objects.set(name, objectList);
        return computeBucketSummary(bucket, objectList, index < externalBuckets.length);
      });
    const bucketsInfos = await Promise.all(bucketsInfosPromises);
    dispatch({ buckets, objects, bucketsInfos })
  }, [fetchBucketList, listObjects, externalBuckets]);

  const mountBucket = async (bucket: Bucket) => {
    if (!(await headBucket(bucket))) {
      return false;
    }
    if (!externalBuckets.find(b => b.Name === bucket.Name)) {
      setExternalBuckets(externalBuckets.concat([bucket]));
    }
    return true;
  }

  const unmountBucket = async (bucket: Bucket) => {
    const extBuckets = externalBuckets.filter(b => b.Name !== bucket.Name)
    setExternalBuckets(extBuckets);
  }

  useEffect(() => {
    if (isAuthenticated && !componentDidMount.current) {
      componentDidMount.current = true;
      updateStore();
    }
  }, [isAuthenticated, updateStore]);

  /** Empty the store */
  const reset = () => {
    dispatch(initialState);
  }

  return (
    <BucketStoreContext.Provider
      value={{
        ...state,
        updateStore,
        mountBucket,
        unmountBucket,
        reset
      }}
    >
      {children}
    </BucketStoreContext.Provider>
  )
}
