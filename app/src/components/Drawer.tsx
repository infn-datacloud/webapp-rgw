import { staticRoutes } from '../routes';
import { useOAuth } from '../services/OAuth';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from './Button';
import { ArrowLeftOnRectangleIcon } from '@heroicons/react/24/outline';
import { useS3 } from '../services/S3';
import { useBucketStore } from '../services/BucketStore';

export const Drawer = () => {
  const oAuth = useOAuth();
  const s3 = useS3();
  const bucketStore = useBucketStore();
  const { user } = oAuth;
  const navigate = useNavigate();
  const path = window.location.pathname;
  const routes = staticRoutes.filter(el => el.drawer);
  const links = routes.map(route => {
    let className = "h-10 flex hover:text-white hover:bg-infn items-center hover:rounded-lg ph-4 ";
    if (route.path === path) {
      className += "rounded-lg bg-gray-200";
    }
    return (
      <li className={className} key={route.path}>
        <Link className='p-4' to={route.path}>{route.title}</Link>
      </li>
    )
  });

  const logoutAndRedirect = () => {
    console.log("Logout");
    oAuth.logout();
    s3.logout();
    bucketStore.reset();
    navigate("/");
  }

  const userName: string | null = user?.profile && user?.profile["name"] ? user?.profile["name"] : null;

  return (
    <div className='h-full bg-gray-100 '>
      <img className="w-full bg-gray-100 p-4" alt="" src="/logo530.png" />
      <div>
        {
          userName ? <div className='p-4 mx-auto text-xl font-semibold'>{userName}</div> : null
        }
        <nav className='p-4'>
          <ul>
            {links}
          </ul>
        </nav>
      </div>
      <div className='absolute inset-x-0 mx-4 bottom-20'>
        <Button
          className='w-full'
          title='Logout'
          icon={<ArrowLeftOnRectangleIcon />}
          onClick={logoutAndRedirect}
        />
      </div>
      <div className="absolute bottom-2 w-full text-sm text-center">
        v{APP_VERSION}</div>
    </div>
  )
}
