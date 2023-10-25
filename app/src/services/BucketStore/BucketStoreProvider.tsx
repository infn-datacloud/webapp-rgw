import { Bucket, _Object } from "@aws-sdk/client-s3";
import { useEffect, useRef, useState } from "react";
import { BucketStoreContext } from "./BucketStoreContext";
import { BucketInfo } from "../../models/bucket";
import { useS3 } from "../S3";

interface BucketStoreProviderBaseProps {
  children?: React.ReactNode;
}

export interface BucketStoreProviderProps extends BucketStoreProviderBaseProps { }

export const BucketStoreProvider = (props: BucketStoreProviderProps): JSX.Element => {
  const { children } = props;
  const { isAuthenticated, fetchBucketList, listObjects } = useS3();
  const [bucketList, setBucketList] = useState<Bucket[]>([]);
  const [bucketsInfos, setBucketsInfos] = useState<BucketInfo[]>([]);

  const fetchBuckets = async () => {
    console.debug("Fetching bucket list");
    try {
      const buckets = await fetchBucketList();
      setBucketList(buckets);
      return buckets;
    } catch (err) {
      console.log(err);
    }
  };

  const fetchBucketsInfos = async (buckets: Bucket[]) => {
    const promises = buckets.map(bucket => listObjects(bucket));
    const objectsLists = await Promise.all(promises);
    const infos = buckets.map((bucket, i) => {
      const objects = objectsLists[i];
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
    });
    setBucketsInfos(infos);
  };


  const fetchAll = async () => {
    const buckets = await fetchBuckets();
    if (buckets && buckets.length > 0) {
      fetchBucketsInfos(buckets);
    } else {
      setBucketsInfos([]);
    }
  };

  const fetchBucketLock = useRef<boolean>(false);
  useEffect(() => {
    if (isAuthenticated && !fetchBucketLock.current) {
      updateStore();
      fetchBucketLock.current = true;
    }
  });

  const updateStore = () => {
    fetchAll();
  }

  const reset = () => {
    setBucketList([]);
    setBucketsInfos([]);
    fetchBucketLock.current = false;
  }

  return (
    <BucketStoreContext.Provider
      value={{
        bucketList,
        bucketsInfos,
        updateStore,
        reset
      }}
    >
      {children}
    </BucketStoreContext.Provider>
  )
}
