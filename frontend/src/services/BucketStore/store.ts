import { Bucket, _Object } from "@aws-sdk/client-s3";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useS3Service } from "../S3";
import { BucketInfo } from "../../models/bucket";

interface BucketStoreContext {
  bucketList: Bucket[];
  bucketsInfos: BucketInfo[];
  updateStore: () => void;
}

const defaultBucketStore: BucketStoreContext = {
  bucketList: [],
  bucketsInfos: [],
  updateStore: function () { }
};


export function CreateBucketStore() {
  const { isAuthenticated, fetchBucketList, listObjects } = useS3Service();
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

  const fetchBucketsInfos = (buckets: Bucket[]) => {
    const promisesMap = buckets.reduce<Map<string, Promise<_Object[]>>>((acc, bucket) => {
      if (!bucket.Name) return acc;
      acc.set(bucket.Name, listObjects(bucket));
      return acc;
    }, new Map());

    Promise.all(promisesMap.values())
      .then(response => {
        const _bucketInfos: BucketInfo[] = [];
        for (let i = 0; i < response.length; ++i) {
          const bucketInfo = response[i].reduce<BucketInfo>((acc, el) => {
            acc.size += el.Size ?? 0.0;
            acc.objects++;
            return acc;
          }, {
            name: buckets[i].Name ?? "N/A",
            creation_date: buckets[i].CreationDate?.toString() ?? "N/A",
            rw_access: { read: true, write: true },
            objects: 0,
            size: 0
          });
          _bucketInfos.push(bucketInfo);
        }
        setBucketInfos(_bucketInfos);
      });
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
      fetchAll();
      fetchBucketLock.current = true;
    }
  });

  const updateStore = () => {
    fetchAll();
  }

  return {
    bucketList: bucketList,
    bucketsInfos: bucketInfos,
    updateStore: updateStore
  }
}

export const BucketStore = createContext<BucketStoreContext>(defaultBucketStore);

export function useBucketStore() {
  return useContext(BucketStore);
}
