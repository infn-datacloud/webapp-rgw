import React from 'react';
import { Home } from './Home';
import { Pippo } from './Pippo';
import { RouteObject } from 'react-router-dom';

export type Route = {
  title: string,
  route: RouteObject
}

export const routes: Route[] = [
  { title: "Home", route: { path: "/", element: <Home /> } },
  { title: "Pippo", route: { path: "/pippo", element: <Pippo /> } }
];