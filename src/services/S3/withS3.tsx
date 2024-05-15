import { S3Provider, S3ProviderProps } from "./S3Provider";
type Props = {
  Comp?: React.ComponentType;
};

export function withS3(
  WrappedComponent: React.FunctionComponent<Props>,
  s3Config: S3ProviderProps
) {
  return function (props: Props) {
    return (
      <S3Provider {...s3Config}>
        <WrappedComponent {...props} />
      </S3Provider>
    );
  };
}
