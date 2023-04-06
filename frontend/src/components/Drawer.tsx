import { routes } from '../routes';
import { Link } from 'react-router-dom';

export const Drawer = () => {
  const path = window.location.pathname;
  const links = routes.map(route => {
    let className = "h-10 hover:bg-neutral-300 rounded-lg p-2";
    className += route.path === path ? " bg-neutral-200" : "";
    return (
      <li className={className} key={route.path}>
        <Link className="block h-10" to={route.path}>{route.title}</Link>
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