import { ReactNode } from 'react';
import { Home } from './Home';

export type Route = {
  title: string,
  path: string,
  element: ReactNode
}

export const staticRoutes: Route[] = [
  { title: "Home", path: "/", element: <Home /> },
  { title: "Buckets", path: "/buckets", element: <div></div> }
];
