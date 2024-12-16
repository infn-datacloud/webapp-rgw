"use client";

export default function DismissButton(props: {
  id: string;
  className?: string;
}) {
  function closeSidebar() {
    const sidebar = document.getElementById("left-sidebar");
    sidebar?.classList.remove("show-sidebar");
    const self = document.getElementById(props.id);
    self?.classList.add("hidden");
  }

  return <button {...props} onClick={closeSidebar} type="button" />;
}
