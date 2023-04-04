import React, { ReactElement } from "react";
import { Drawer } from "./Drawer";

type Props = {
  title?: string,
  children: ReactElement
};

export const Page = ({ children }: Props) => {
  return (
    <>
      <div id="sidebar" className="w-64 left-0 top-0 h-screen fixed z-1 overflow-auto">
        <Drawer />
      </div>
      <div className="ml-64 p-8">
        {children}
      </div>
    </>
  );
}