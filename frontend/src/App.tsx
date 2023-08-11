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

function App() {
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

  const router = createBrowserRouter(routes);

  return (
    <div className="flex mb-4">
      <RouterProvider router={router} />
    </div>
  )
}

export default withBucketStore(App);
