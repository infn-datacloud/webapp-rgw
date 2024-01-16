import { BucketStoreProvider } from "./BucketStoreProvider";

type Props = {
  Comp?: React.ComponentType;
};

export function withBucketStore(
  WrappedComponent: React.FunctionComponent<Props>
) {
  return function (props: Props) {
    return (
      <BucketStoreProvider>
        <WrappedComponent {...props} />
      </BucketStoreProvider>
    );
  };
}
