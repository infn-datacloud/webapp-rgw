// SPDX-FileCopyrightText: 2025 Istituto Nazionale di Fisica Nucleare
//
// SPDX-License-Identifier: EUPL-1.2

import { Button } from "@/components/buttons";
import { ArrowUturnRightIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";

export default function RefreshButton() {
  const router = useRouter();
  const handleClick = () => router.refresh();
  return (
    <Button
      className="btn-secondary hidden sm:flex"
      title="Refresh"
      onClick={handleClick}
    >
      <ArrowUturnRightIcon className="size-5" />
      Refresh
    </Button>
  );
}
