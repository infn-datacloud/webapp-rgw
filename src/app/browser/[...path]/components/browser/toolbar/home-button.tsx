// SPDX-FileCopyrightText: 2025 Istituto Nazionale di Fisica Nucleare
//
// SPDX-License-Identifier: EUPL-1.2

import Link from "next/link";
import { HomeIcon } from "@heroicons/react/24/outline";

export default function HomeButton() {
  return (
    <Link href="/">
      <button className="btn-secondary">
        <HomeIcon className="size-5" />
        Home
      </button>
    </Link>
  );
}
