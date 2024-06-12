"use client";
import { tailwindConfig } from "@/commons/utils";
import { Bars3Icon } from "@heroicons/react/24/outline";
import { useEffect, useRef } from "react";

const breakPoint = parseInt(tailwindConfig.theme.screens.lg);
const sidebarId = "left-sidebar";

export default function BurgerButton() {
  const defaultSidebarClasses = useRef("");

  useEffect(() => {
    const element = document.getElementById(sidebarId);
    if (!element) {
      console.warn(`element with id '${sidebarId}' not found`);
      return;
    }

    defaultSidebarClasses.current = element.className;

    const onResize = () => {
      if (window.screen.width > breakPoint) {
        element.className = defaultSidebarClasses.current;
      }
    };

    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
    };
  }, []);

  function toggleSidebar() {
    const element = document.getElementById(sidebarId);
    if (!element) {
      console.warn(`element with id '${sidebarId}' not found`);
      return;
    }
    element?.classList.toggle("translate-x-0");
  }

  return (
    <button className="my-auto lg:hidden" onClick={toggleSidebar}>
      <Bars3Icon className="w-8 text-secondary" />
    </button>
  );
}
