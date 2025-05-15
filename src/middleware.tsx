// SPDX-FileCopyrightText: 2025 Istituto Nazionale di Fisica Nucleare
//
// SPDX-License-Identifier: EUPL-1.2

export { auth as middleware } from "@/auth";

export const config = {
  matcher: "/((?!api/auth|_next/static|_next/image|favicon.ico|fonts|login).*)",
};
