import React, { ReactElement } from "react";

type Props = {
  title?: string,
  children: ReactElement
};

export const Page = ({ children }: Props) => {
  return (
    <div className="container px-4 mt-4">
      {children}
    </div>
  );
}