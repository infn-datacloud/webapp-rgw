import { ReactNode } from 'react';
import { Home } from './Home';
import { BucketAdministration } from './BucketAdministration';
import { OAuthPopup } from '../services/OAuth2';
import { Login } from './Login';

export type Route = {
  title: string,
  path: string,
  element: ReactNode
  drawer: boolean
}

export const staticRoutes: Route[] = [
  { title: "Home", path: "/", element: <Home />, drawer: true },
  { title: "Buckets", path: "/buckets", element: <BucketAdministration />, drawer: true },
  { title: "OAuth2Callback", path: "/callback", element: <OAuthPopup />, drawer: false },
  { title: "Login", path: "/login", element: <Login />, drawer: false }
];
