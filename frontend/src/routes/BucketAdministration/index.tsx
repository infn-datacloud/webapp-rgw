import { Page } from "../../components/Page";
import { useS3Service, CreateBucketArgs } from "../../services/S3Service";
import { useState } from "react";
import { Toolbar } from "./Toolbar";
import { BucketSummaryView } from "./BucketSummaryView";
import { NewBucketModal } from "./NewBucketModal";
import { useBucketStore } from "../../services/BucketStore";

export const BucketAdministration = () => {
  const { bucketsInfos, updateStore } = useBucketStore();
  const [showNewBucketModal, setShowNewBucketModal] = useState(false);
  const { createBucket, deleteBucket } = useS3Service();

  const onCloseNewBucketModal = () => {
    setShowNewBucketModal(false);
  }

  const handleCreateBucket = (args: CreateBucketArgs) => {
    createBucket(args)
      .then(() => {
        console.log("Bucket successfully created")
        updateStore();
      })
      .catch((err) => console.error(err));
    setShowNewBucketModal(false);
  };

  const handleDeleteBucket = (bucket: string) => {
    deleteBucket(bucket)
      .then(() => {
        console.log(`Bucket ${bucket} successfully deleted`);
        updateStore();
      })
      .catch(err => console.error(err));
  };

  const BucketInfos = () => {
    return (
      <div>
        {bucketsInfos.map(el => {
          return <BucketSummaryView
            key={el.name}
            onDeleteBucket={handleDeleteBucket}
            {...el} />
        })}
      </div>)
  };

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
};
