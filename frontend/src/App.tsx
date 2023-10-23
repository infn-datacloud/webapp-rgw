import {
  createBrowserRouter,
  RouterProvider,
} from 'react-router-dom';
import { staticRoutes } from './routes';
import { withBucketStore } from './services/BucketStore';
import { S3ServiceProviderProps, withS3 } from './services/S3';
import { withNotifications } from './services/Notifications';
import { useAuth } from 'react-oidc-context';
import { withOAuth2 } from './services/OAuth2/wrapper';

const AppRaw = () => {
  const routes = staticRoutes.map(route => {
    return {
      path: route.path,
      element: route.element
    }
  });

  const router = createBrowserRouter(routes);

  return (
    <div className="flex mb-4">
      <RouterProvider router={router} />
    </div>
  )
}

type AppProps = {
  oidcConfig: OAuthProviderProps;
  s3Config: S3ServiceProviderProps;
}

export const App = ({ oidcConfig, s3Config }: AppProps) => {
  let ExtendedApp = withBucketStore(AppRaw);
  ExtendedApp = withS3(ExtendedApp, s3Config);
  ExtendedApp = withNotifications(ExtendedApp);
  ExtendedApp = withOAuth2(ExtendedApp, oidcConfig);
  return ExtendedApp({});
}
