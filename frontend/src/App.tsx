import {
  BrowserRouter,
  createBrowserRouter,
  Route,
  RouterProvider,
  Routes
} from 'react-router-dom';
import { Login } from './routes/Login';
import { staticRoutes } from './routes';
import { useOAuth, OAuthPopup } from './services/OAuth2';
import { withBucketStore } from './services/BucketStore';
import { S3ServiceProviderProps, withS3 } from './services/S3';
import { withNotifications } from './services/Notification';
import { OAuthProviderProps } from './services/OAuth2';
import { withOAuth2 } from './services/OAuth2/wrapper';


const AppRaw = () => {
  const oAuth = useOAuth();

  if (oAuth.error) {
    return <div>Ops... {oAuth.error.message}</div>;
  }

  if (!oAuth.isAuthenticated) {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login onClick={oAuth.signinPopup} />} />
          <Route path="/callback" element={<OAuthPopup />} />
        </Routes>
      </BrowserRouter>
    )
  }

  // Add routes
  const routes = staticRoutes.map(route => {
    return {
      path: route.path,
      element: route.element
    }
  });

  routes.push({
    path: "/login",
    element: <Login onClick={oAuth.signinPopup} />,
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
