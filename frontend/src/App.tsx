import {
  BrowserRouter,
  createBrowserRouter,
  Route,
  RouterProvider,
  Routes
} from 'react-router-dom';
import { Login } from './routes/Login';
import { staticRoutes } from './routes';
import { BucketsListContext } from './services/BucketListContext';
import { useOAuth } from './services/OAuth2';
import { OAuthPopup } from './services/OAuth2';
import { useState } from 'react';
import { BucketInfo } from './models/bucket';

function App() {

  const [bucketList, setBucketList] = useState<BucketInfo[]>([]);
  const oAuth = useOAuth();

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
    element: <Login onClick={oAuth.signinPopup} />
  });
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