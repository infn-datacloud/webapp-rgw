// SPDX-FileCopyrightText: 2025 Istituto Nazionale di Fisica Nucleare
//
// SPDX-License-Identifier: EUPL-1.2

import { getSession } from "@/auth";
import { Sidebar } from "@/app/components/sidebar";
import { settings } from "@/config";

type LayoutProps = {
  title?: string;
  children?: React.ReactNode;
};

export async function Layout(props: Readonly<LayoutProps>) {
  const { title, children } = props;
  const session = await getSession();
  const username = session?.user?.name;
  const email = session?.user?.email;
  const { WEBAPP_RGW_VERSION } = settings;

  return (
    <div className="mt-16 p-4 lg:mt-0 lg:ml-80">
      <Sidebar
        username={username}
        email={email}
        appVersion={WEBAPP_RGW_VERSION}
      />
      <h1 className="text-primary dark:text-secondary">{title}</h1>
      <hr className="mt-2 mb-8 h-px w-full border-0 bg-gray-200" />
      <div className="sm:px-16">{children}</div>
    </div>
  );
}
