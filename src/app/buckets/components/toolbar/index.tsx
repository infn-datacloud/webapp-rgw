// SPDX-FileCopyrightText: 2025 Istituto Nazionale di Fisica Nucleare
//
// SPDX-License-Identifier: EUPL-1.2

import CreateBucketButton from "./create-button";

export default function Toolbar() {
  return (
    <div className="mb-4 flex">
      <CreateBucketButton />
    </div>
  );
}
