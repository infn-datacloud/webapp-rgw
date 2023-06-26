import { Bucket, _Object } from "@aws-sdk/client-s3";
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { useS3Service } from "./S3Service";
import { BucketInfo } from "../models/bucket";

interface BucketStoreContext {
  bucketList: Bucket[];
  bucketsInfos: BucketInfo[];
  updateStore: () => void;
};

const defaultBucketStore: BucketStoreContext = {
  bucketList: [],
  bucketsInfos: [],
  updateStore: function () { }
};

const BucketStore = createContext<BucketStoreContext>(defaultBucketStore);

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

  const fetchBucketsInfos = useCallback(() => {
    console.debug("Fetching bucket infos");
    const promisesMap = bucketList.reduce<Map<string, Promise<_Object[]>>>((acc, bucket) => {
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
            name: bucketList[i].Name ?? "N/A",
            creation_date: bucketList[i].CreationDate?.toString() ?? "N/A",
            rw_access: { read: true, write: true },
            objects: 0,
            size: 0
          });
          _bucketInfos.push(bucketInfo);
        }
        setBucketInfos(_bucketInfos);
      });
  }, [bucketList, listObjects]);

  const fetchBucketLock = useRef<boolean>(false);

  useEffect(() => {
    if (isAuthenticated() && !fetchBucketLock.current) {
      fetchBuckets();
    }

    if (bucketList.length > 0 && bucketInfos.length === 0) {
      fetchBucketsInfos();
    }

    return (() => {
      fetchBucketLock.current = isAuthenticated();
    })
  });

  const updateStore = () => {
    fetchBucketList();
  }

  return {
    bucketList: bucketList,
    bucketsInfos: bucketInfos,
    updateStore: updateStore
  }
};

export function useBucketStore() {
  return useContext(BucketStore);
};

export function withBucketStore(WrappedComponent: React.FunctionComponent) {
  return function (props: any) {
    const store = CreateBucketStore();
    return (
      <BucketStore.Provider value={store}>
        <WrappedComponent {...props} />;
      </BucketStore.Provider>
    );
  };
};