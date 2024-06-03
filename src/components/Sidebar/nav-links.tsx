import SidebarLink from "./sidebar-link";

export function Links() {
  return (
    <nav className="p-4">
      <ul>
        <SidebarLink title="Home" href="/home" />
        <SidebarLink title="Buckets" href="/buckets" />
      </ul>
    </nav>
  );
}
