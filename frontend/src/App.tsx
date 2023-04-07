import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { BucketInfo } from './models/bucket';
import { routes } from './routes';
import APIService from './services/APIService';
import { BucketsListContext } from './services/BucketListContext';

function App() {

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [bucketList, setBucketLists] = useState<BucketInfo[]>([]);

  useEffect(() => {
    setIsAuthenticated(APIService.isAuthenticated());
    APIService
      .get("buckets")
      .then(data => {
        const buckets: BucketInfo[] = data["buckets"];
        console.log(`Fetched ${buckets.length} buckets`);
        setBucketLists(buckets);
      });
  }, [isAuthenticated]);


  const router = createBrowserRouter(routes.map(route => {
    return {
      path: route.path,
      element: route.element
    }
  }))

  return (
    <div className="flex mb-4">
      <BucketsListContext.Provider value={bucketList}>
        <RouterProvider router={router} />
      </BucketsListContext.Provider>
    </div>
  )
}

export default App;