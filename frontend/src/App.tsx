import { routes } from './routes';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';


function App() {
  const router = createBrowserRouter(routes.map(route => {
    return {
      path: route.path,
      element: route.element
    }
  }));

  return (
    <div className="flex mb-4">
      <RouterProvider router={router} />
    </div>
  )
}

export default App;