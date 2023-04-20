import {
  BrowserRouter,
  createBrowserRouter,
  Route,
  RouterProvider,
  Routes
} from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Login } from './routes/Login';
import { staticRoutes } from './routes';
import { useOAuth, OAuthPopup } from './services/OAuth2';
import { BucketsListContext } from './services/BucketListContext';
import { useS3Service } from './services/S3Service';
import { BucketBrowser } from './routes/BucketBrowser';
import { ListBucketsCommand, Bucket } from '@aws-sdk/client-s3';


function App() {

  const [bucketList, setBucketList] = useState<Bucket[]>([]);
  const oAuth = useOAuth();
  const s3 = useS3Service();

  useEffect(() => {
    if (!s3.isAuthenticated()) {
      return;
    }

    const listBucketCmd = new ListBucketsCommand({});
    s3.client.send(listBucketCmd)
      .then(response => {
        const { Buckets } = response;
        if (!Buckets) {
          console.warn("Warning: Expected Bucket[], got  undefined");
          return;
        }
        console.log(Buckets);
        setBucketList(Buckets);
      })
      .catch(err => {
        console.error(err);
      });
  }, [s3]);



  if (oAuth.error) {
    return <div>Ops... {oAuth.error.message}</div>;
  }

  console.log("Is user authenticated", oAuth.isAuthenticated)

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

  return (
    <div className="flex mb-4">
      <BucketsListContext.Provider value={bucketList}>
        <RouterProvider router={router} />
      </BucketsListContext.Provider>
    </div>
  )
}

export default App;