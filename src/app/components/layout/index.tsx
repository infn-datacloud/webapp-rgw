// SPDX-FileCopyrightText: 2025 Istituto Nazionale di Fisica Nucleare
//
// SPDX-License-Identifier: EUPL-1.2

import getConfig from "next/config";
import { Sidebar } from "@/app/components/sidebar";
import { auth } from "@/auth";

type LayoutProps = {
  title?: string;
  children?: React.ReactNode;
};

export async function Layout(props: Readonly<LayoutProps>) {
  const { title, children } = props;
  const { serverRuntimeConfig = {} } = getConfig() || {};
  const session = await auth();
  const username = session?.user?.name;

  return (
    <div className="mt-16 p-4 lg:mt-0 lg:ml-80">
      <Sidebar
        username={username}
        appVersion={serverRuntimeConfig.appVersion}
      />
      <h1 className="text-primary dark:text-secondary">{title}</h1>
      <hr className="mt-2 mb-8 h-px w-full border-0 bg-gray-200" />
      <div className="sm:px-16">{children}</div>
    </div>
  );
}
