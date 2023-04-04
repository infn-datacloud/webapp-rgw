import React from 'react';
import { routes } from '../routes';

export const Drawer = () => {

  const items = routes.map(el => {
    return (
      <li key={el.route.path}>
        <a href={el.route.path}>{el.title}</a>
      </li>
    );
  })

  return (
    <div id="sidebar" className="top-0 left-0 w-64 overflow-y-auto">
      <img className="w-full bg-gray-100 p-4" alt="" src="/logo530.png" style={{ mixBlendMode: "multiply" }} />
      <nav className="h-screen">
        <div className="h-full p-4 overflow-y-auto bg-gray-100 dark:bg-gray-800">
          <ul>
            {items}
          </ul>
        </div>
      </nav>
    </div>
  )
}