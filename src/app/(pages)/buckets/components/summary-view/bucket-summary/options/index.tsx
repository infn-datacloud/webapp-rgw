import { BucketConfiguration } from "@/models/bucket";
import { Bucket } from "@aws-sdk/client-s3";
import DeleteBucketButton from "./delete-button";
import EditBucketButton from "./edit-button";
import { Options } from "@/components/buttons";

type OptionsProps = {
  bucket: Bucket;
  configuration?: BucketConfiguration;
};

export function BucketOptions(props: Readonly<OptionsProps>) {
  const { bucket, configuration } = props;
  return (
    <Options>
      <DeleteBucketButton bucket={bucket} />
      <EditBucketButton bucket={bucket} configuration={configuration} />
    </Options>
  );
}
