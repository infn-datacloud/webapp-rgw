import { CreateS3ServiceProvider, S3ServiceContext } from './service';
import { S3ServiceProviderProps } from './types';

type Props = {
  Comp?: React.ComponentType
}

export function withS3(WrappedComponent: React.FunctionComponent<Props>,
  s3Config: S3ServiceProviderProps) {
  return function (props: Props) {
    const serviceProvider = CreateS3ServiceProvider(s3Config);
    return (
      <S3ServiceContext.Provider value={serviceProvider}>
        <WrappedComponent {...props} />
      </S3ServiceContext.Provider>
    );
  };
}
