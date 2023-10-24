import { Bucket, _Object } from "@aws-sdk/client-s3";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useS3 } from "../S3";
import { BucketInfo } from "../../models/bucket";

interface BucketStoreContext {
  bucketList: Bucket[];
  bucketsInfos: BucketInfo[];
  updateStore: () => void;
  reset: () => void;
}

const defaultBucketStore: BucketStoreContext = {
  bucketList: [],
  bucketsInfos: [],
  updateStore: function () { },
  reset: function () { }
};


export function CreateBucketStore() {
  const { isAuthenticated, fetchBucketList, listObjects } = useS3();
  const [bucketList, setBucketList] = useState<Bucket[]>([]);
  const [bucketInfos, setBucketInfos] = useState<BucketInfo[]>([]);

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
      let info: BucketInfo = {
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
    setBucketInfos(infos);
  };


  const fetchAll = async () => {
    const buckets = await fetchBuckets();
    if (buckets && buckets.length > 0) {
      fetchBucketsInfos(buckets);
    } else {
      setBucketInfos([]);
    }
  }

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
    setBucketInfos([]);
    fetchBucketLock.current = false;
  }

  return {
    bucketList: bucketList,
    bucketsInfos: bucketInfos,
    updateStore: updateStore,
    reset: reset
  }
}

export const BucketStore = createContext<BucketStoreContext>(defaultBucketStore);

export function useBucketStore() {
  return useContext(BucketStore);
}
