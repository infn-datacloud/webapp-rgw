import { BucketStore, CreateBucketStore } from "./store";

type Props = {
  Comp?: React.ComponentType
}

export function withBucketStore(WrappedComponent: React.FunctionComponent<Props>) {
  return function (props: Props) {
    const store = CreateBucketStore();
    return (
      <BucketStore.Provider value={store}>
        <WrappedComponent {...props} />
      </BucketStore.Provider>
    );
  };
}
