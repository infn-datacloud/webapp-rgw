import React from "react";
import { routes } from './routes';
import { Drawer } from './components/Drawer';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';


const router = createBrowserRouter(routes.map(el => el.route));

function App() {
  return (
    <div className="flex mb-4">
      <Drawer />
      <RouterProvider router={router} />
    </div>
  )
}

export default App;