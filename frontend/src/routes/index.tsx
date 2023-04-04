import React, { ReactNode } from 'react';
import { Home } from './Home';
import { Pippo } from './Pippo';

export type Route = {
  title: string,
  path: string,
  element: ReactNode
}

export const routes: Route[] = [
  { title: "Home", path: "/", element: <Home /> },
  { title: "Pippo", path: "/pippo", element: <Pippo /> }
];
