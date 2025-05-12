import SidebarLink from "./sidebar-link";

export function Links() {
  return (
    <ul className="space-y-1">
      <SidebarLink title="Browser" href="/browser" />
      <SidebarLink title="Buckets" href="/buckets" />
    </ul>
  );
}
