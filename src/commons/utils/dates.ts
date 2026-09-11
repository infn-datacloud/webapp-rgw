// SPDX-FileCopyrightText: 2026 Istituto Nazionale di Fisica Nucleare
//
// SPDX-License-Identifier: EUPL-1.2

import { cache } from "react";

export const getNow = cache(() => Date.now());

export function addHours(time: number, hours: number) {
  return new Date(time + hours * 3600000);
}
