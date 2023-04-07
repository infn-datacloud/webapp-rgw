import { Page } from '../../components/Page';

type PropsType = {
  bucketName: string
}

export const BucketBrowser = ({ bucketName }: PropsType) => {

  return (
    <Page title={bucketName}>
      <div>

      </div>
    </Page>
  )
}