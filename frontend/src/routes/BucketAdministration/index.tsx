import { Page } from "../../components/Page";
import { useS3Service, CreateBucketArgs } from "../../services/S3Service";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { BucketInfo } from "../../models/bucket";
import { BucketListContext } from "../../services/BucketListContext";
import { _Object } from "@aws-sdk/client-s3";
import { Toolbar } from "./Toolbar";
import { BucketSummaryView } from "./BucketSummaryView";
import { NewBucketModal } from "./NewBucketModal";

export const BucketAdministration = () => {
  const { bucketList } = useContext(BucketListContext);
  const lockRef = useRef<boolean>(false);
  const [bucketInfos, setBucketInfos] = useState<BucketInfo[]>([]);
  const [showNewBucketModal, setShowNewBucketModal] = useState(false);
  const { listObjects, createBucket } = useS3Service();

  const fetchBucketInfos = useCallback(() => {
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

  useEffect(() => {
    if (!lockRef.current && bucketList.length > 0) {
      fetchBucketInfos();
    }
    if (bucketList.length > 0) {
      return (() => {
        lockRef.current = true;
      })
    }
  }, [bucketList, fetchBucketInfos]);

  const BucketInfos = () => {
    return (
      <div>
        {bucketInfos.map(el => {
          return <BucketSummaryView key={el.name} {...el} />
        })}
      </div>)
  };

  const onCloseNewBucketModal = () => {
    setShowNewBucketModal(false);
  }

  const handleCreateBucket = (args: CreateBucketArgs) => {
    createBucket(args)
      .then(() => console.log("Bucket successfully created"))
      .catch((err) => console.error(err));
    setShowNewBucketModal(false);
  }

  return (
    <Page title="Buckets">
      <NewBucketModal
        open={showNewBucketModal}
        onClose={onCloseNewBucketModal}
        onCreateBucket={(args: CreateBucketArgs) => handleCreateBucket(args)}
      />
      <Toolbar
        className="mb-4"
        onClickNewBucket={() => setShowNewBucketModal(true)}
      />
      <BucketInfos />
    </Page>
  )
}