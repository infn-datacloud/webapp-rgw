import {
  BrowserRouter,
  createBrowserRouter,
  Route,
  RouterProvider,
  Routes
} from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Login } from './routes/Login';
import { staticRoutes } from './routes';
import { useOAuth, OAuthPopup } from './services/OAuth2';
import { BucketListContext } from './services/BucketListContext';
import { BucketBrowser } from './routes/BucketBrowser';
import { Bucket } from '@aws-sdk/client-s3';
import { useS3Service } from './services/S3Service';

function App() {

  const [bucketList, setBucketList] = useState<Bucket[]>([]);
  const oAuth = useOAuth();
  const { isAuthenticated, fetchBucketList } = useS3Service();

  const bucketContextValue = {
    bucketList: bucketList,
    setBuckets: setBucketList
  }

  // Fetch bucket lists
  const fetchBuckets = async () => {
    try {
      const buckets = await fetchBucketList();
      setBucketList(buckets);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    if (isAuthenticated() && bucketList.length === 0) {
      fetchBuckets();
    }
  });

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

  return (
    <div className="flex mb-4">
      <BucketListContext.Provider value={bucketContextValue}>
        <RouterProvider router={router} />
      </BucketListContext.Provider>
    </div>
  )
}

export default App;