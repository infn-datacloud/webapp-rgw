import { Page } from "../../components/Page";
import { useS3, CreateBucketArgs } from "../../services/S3";
import { useState } from "react";
import { Toolbar } from "./Toolbar";
import { BucketSummaryView } from "./BucketSummaryView";
import { NewBucketModal } from "./NewBucketModal";
import { useBucketStore } from "../../services/BucketStore";
import {
  NotificationType,
  useNotifications,
} from "../../services/Notifications";
import { BucketConfiguration, EditBucketModal } from "./EditBucketModal";
import { camelToWords } from "../../commons/utils";
import { MountBucketModal } from "./MountBucket";

export const BucketAdministration = () => {
  const { bucketsInfos, updateStore, unmountBucket } = useBucketStore();
  const [showNewBucketModal, setShowNewBucketModal] = useState(false);
  const [showMountBucketModal, setShowMountBucketModal] = useState(false);
  const [versioning, setVersioning] = useState(false);
  const [objectLock, setObjectLock] = useState(false);
  const [selectedBucket, setSelectedBucket] = useState<string | undefined>();
  const { notify } = useNotifications();
  const {
    createBucket,
    deleteBucket,
    getBucketVersioning,
    setBucketVersioning,
    getBucketObjectLock,
    setBucketObjectLock,
  } = useS3();

  const onCloseNewBucketModal = () => {
    setShowNewBucketModal(false);
  };

  const handleCreateBucket = (args: CreateBucketArgs) => {
    createBucket(args)
      .then(() => {
        notify(
          "Success!",
          "Bucket successfully created",
          NotificationType.success
        );
        updateStore();
      })
      .catch((err: Error) =>
        notify(
          "Cannot create Bucket",
          camelToWords(err.name),
          NotificationType.error
        )
      );
    setShowNewBucketModal(false);
  };

  const handleDeleteBucket = (bucket: string) => {
    deleteBucket(bucket)
      .then(() => {
        notify(
          "Success!",
          "Bucket successfully deleted",
          NotificationType.success
        );
        updateStore();
      })
      .catch((err: Error) =>
        notify(
          "Cannot delete Bucket",
          camelToWords(err.name),
          NotificationType.error
        )
      );
  };

  const handleUnmountBucket = (bucket: string) => {
    unmountBucket({ Name: bucket });
  };

  const handleSelectBucket = (bucketName: string) => {
    setSelectedBucket(bucketName);
    fetchObjectLock(bucketName); // https://stackoverflow.com/a/63919993
    fetchVersioning(bucketName);
  };

  const fetchVersioning = async (bucket: string) => {
    try {
      const result = await getBucketVersioning(bucket);
      setVersioning(result.Status === "Enabled");
    } catch (err) {
      if (err instanceof Error) {
        notify(
          "Cannot retrieve bucket versioning",
          camelToWords(err.name),
          NotificationType.error
        );
      } else {
        console.error(err);
      }
    }
  };

  const fetchObjectLock = async (bucket: string) => {
    try {
      const result = await getBucketObjectLock(bucket);
      const enabled =
        result.ObjectLockConfiguration?.ObjectLockEnabled === "Enabled";
      setObjectLock(enabled);
    } catch (err) {
      if (err instanceof Error) {
        notify(
          "Cannot retrieve bucket object lock",
          camelToWords(err.name),
          NotificationType.error
        );
      } else {
        console.error(err);
      }
    }
  };

  const handleBucketUpdateConfiguration = async (
    bucket: string,
    config: BucketConfiguration
  ) => {
    try {
      if (config.versioningEnabled !== versioning) {
        setBucketVersioning(bucket, config.versioningEnabled);
      }
      if (config.objectLockEnabled !== objectLock) {
        setBucketObjectLock(bucket, config.objectLockEnabled);
      }
      notify("Success!", "Bucket settings changed", NotificationType.success);
    } catch (err) {
      if (err instanceof Error) {
        notify(
          "Cannot edit bucket options",
          camelToWords(err.name),
          NotificationType.error
        );
      }
    }
    setSelectedBucket(undefined);
  };

  const BucketInfos = () => {
    return (
      <div>
        {bucketsInfos.map(el => {
          return (
            <BucketSummaryView
              className={"mb-4"}
              key={el.name}
              onSelect={handleSelectBucket}
              onDelete={handleDeleteBucket}
              onUnmount={handleUnmountBucket}
              {...el}
            />
          );
        })}
      </div>
    );
  };

  return (
    <Page title="Buckets">
      <NewBucketModal
        open={showNewBucketModal}
        onClose={onCloseNewBucketModal}
        onCreateBucket={(args: CreateBucketArgs) => handleCreateBucket(args)}
      />
      <EditBucketModal
        bucketName={selectedBucket}
        versioningEnabled={versioning}
        objectLockEnabled={objectLock}
        onClose={() => setSelectedBucket(undefined)}
        onUpdateBucket={handleBucketUpdateConfiguration}
      />
      <MountBucketModal
        open={showMountBucketModal}
        onClose={() => setShowMountBucketModal(false)}
      />
      <Toolbar
        className="mb-4"
        onClickNewBucket={() => setShowNewBucketModal(true)}
        onClickMountBucket={() => setShowMountBucketModal(true)}
      />
      <BucketInfos />
    </Page>
  );
};
