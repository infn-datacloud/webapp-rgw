import {
  BrowserRouter,
  createBrowserRouter,
  Route,
  RouterProvider,
  Routes
} from 'react-router-dom';
import { useState } from 'react';
import { Login } from './routes/Login';
import { staticRoutes } from './routes';
import { useOAuth, OAuthPopup } from './services/OAuth2';
import { BucketListContext } from './services/BucketListContext';
import { BucketBrowser } from './routes/BucketBrowser';
import { Bucket } from '@aws-sdk/client-s3';

function App() {

  const [bucketList, setBucketList] = useState<Bucket[]>([]);
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



  let routes = staticRoutes.map(route => {
    return {
      path: route.path,
      element: route.element
    }
  });

  routes.push({
    path: "/login",
    element: <Login onClick={oAuth.signinPopup} />,
  });


  // Add /{bucket_name} routes dynamically
  routes = routes.concat(bucketList.reduce((acc: any[], bucket: Bucket) => {
    if (bucket.Name) {
      acc.push({
        path: "/" + bucket.Name,
        element: <BucketBrowser bucketName={bucket.Name} />
      });
    }
    return acc;
  }, []));

  const router = createBrowserRouter(routes);

  const bucketContextValue = {
    bucketList: bucketList,
    setBuckets: setBucketList
  }

  return (
    <div className="flex mb-4">
      <BucketListContext.Provider value={bucketContextValue}>
        <RouterProvider router={router} />
      </BucketListContext.Provider>
    </div>
  )
}

export default App;