import {
  createBrowserRouter,
  RouterProvider,
} from 'react-router-dom';
import { staticRoutes } from './routes';
import { withBucketStore } from './services/BucketStore';
import { S3ProviderProps, useS3, withS3 } from './services/S3';
import { withNotifications } from './services/Notifications';
import { useOAuth, withOAuth } from './services/OAuth';
import { useEffect, useRef } from 'react';

const AppRaw = () => {
  const oAuth = useOAuth();
  const s3 = useS3();
  const didInit = useRef(false);

  // If authenticated via oidc, try login with STS
  useEffect(() => {
    if (!didInit.current) {
      oAuth.events.addUserLoaded(s3.loginWithSTS);
      oAuth.events.userSignedOut(s3.logout);
      didInit.current = true;
    }
  }, [oAuth.events, s3])

  // Create router
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
  s3Config: S3ProviderProps;
}

export const App = ({ s3Config }: AppProps) => {
  let ExtendedApp = withBucketStore(AppRaw);
  ExtendedApp = withS3(ExtendedApp, s3Config);
  ExtendedApp = withNotifications(ExtendedApp);
  ExtendedApp = withOAuth(ExtendedApp);
  return ExtendedApp({});
}
