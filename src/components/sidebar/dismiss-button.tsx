"use client";

export default function DismissButton(props: {
  id: string;
  className?: string;
}) {
  function closeSidebar() {
    const sidebar = document.getElementById("left-sidebar");
    sidebar?.classList.remove("translate-x-0");
    const self = document.getElementById(props.id);
    self?.classList.add("opacity-0");
  }

  return <button {...props} onClick={closeSidebar} type="button" />;
}
