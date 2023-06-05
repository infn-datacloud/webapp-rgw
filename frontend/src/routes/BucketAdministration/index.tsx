import { Page } from "../../components/Page";
import { useS3Service } from "../../services/S3Service";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { BucketInfo } from "../../models/bucket";
import { BucketListContext } from "../../services/BucketListContext";
import { _Object } from "@aws-sdk/client-s3";
import { ClockIcon, CubeIcon, ChartPieIcon } from "@heroicons/react/24/outline";
import { getHumanSize } from "../../commons/utils";


const BucketSummaryView = ({ name, creation_date, rw_access, size, objects }: BucketInfo) => {
  interface SubviewProps {
    title: string,
    text: string,
    icon: JSX.Element
  }

  const Subview = ({ title, text, icon }: SubviewProps) => {
    return (
      <div className="flex mt-2 content-center">
        <div className="w-5 my-auto mr-2">{icon}</div>
        <div className="font-semibold mr-1 my-auto">{title}</div>
        {text}
      </div>
    )
  }

  return (
    <div className="bg-neutral-100 border p-2">
      <div className="text-xl font-semibold">{name}</div>
      <Subview title="Created at:" text={creation_date} icon={<ClockIcon />} />
      <Subview title="Usage:" text={getHumanSize(size) ?? "N/A"} icon={<ChartPieIcon />} />
      <Subview title="Objects:" text={`${objects}`} icon={<CubeIcon />} />
    </div>
  )
};

export const BucketAdministration = () => {
  const { bucketList } = useContext(BucketListContext);
  const lockRef = useRef<boolean>(false);
  const [bucketInfos, setBucketInfos] = useState<BucketInfo[]>([]);
  const { listObjects } = useS3Service();

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
  }, [bucketList, fetchBucketInfos])

  const BucketInfoViews = bucketInfos.map(el => {
    return <BucketSummaryView key={el.name} {...el} />
  })

  return (
    <Page title="Buckets">
      {BucketInfoViews}
    </Page>
  )
}