// SPDX-FileCopyrightText: 2025 Istituto Nazionale di Fisica Nucleare
//
// SPDX-License-Identifier: EUPL-1.2

import UploaderProvider from "@/components/uploader";

type BrowserLayoutProps = {
  children: React.ReactNode;
};

export default async function BrowserLayout(
  props: Readonly<BrowserLayoutProps>
) {
  const { children } = props;
  return (
    <UploaderProvider>
      <>{children}</>
    </UploaderProvider>
  );
}
