import { ReactNode } from 'react';
import { Home } from './Home';
import { BucketAdministration } from './BucketAdministration';
import { Login } from './Login';
import { OAuth2 } from './OAuth2';

export type Route = {
  title: string,
  path: string,
  element: ReactNode
  drawer: boolean
}

export const staticRoutes: Route[] = [
  { title: "Home", path: "/", element: <Home />, drawer: true },
  { title: "Buckets", path: "/buckets", element: <BucketAdministration />, drawer: true },
  { title: "Login", path: "/login", element: <Login />, drawer: false },
  { title: "OAuth", path: "/callback", element: <OAuth2 />, drawer: false }
];
