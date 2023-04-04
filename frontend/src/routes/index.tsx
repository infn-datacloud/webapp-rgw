import React, { ReactNode } from 'react';
import { Home } from './Home';
import { Buckets } from './Buckets';

export type Route = {
  title: string,
  path: string,
  element: ReactNode
}

export const routes: Route[] = [
  { title: "Home", path: "/", element: <Home /> },
  { title: "Buckets", path: "/buckets", element: <Buckets /> }
];
