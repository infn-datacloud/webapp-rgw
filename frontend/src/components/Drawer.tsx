import React from 'react';
import { routes } from '../routes';
import { Link } from 'react-router-dom';

export const Drawer = () => {

  const links = routes.map(route => {
    return (
      <li key={route.path}>
        <Link to={route.path}>{route.title}</Link>
      </li>
    )
  });

  return (
    <>
      <img className="w-full bg-gray-100 p-4" alt="" src="/logo530.png" />
      <nav className="h-full p-4 bg-gray-100 dark:bg-gray-800">
        <ul>
          {links}
        </ul>
      </nav>
    </>
  )
}