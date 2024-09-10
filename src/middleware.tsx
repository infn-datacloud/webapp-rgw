import { auth } from "@/auth";
import { NextResponse } from "next/server";
export const config = {
  matcher: "/((?!api/auth|_next/static|_next/image|favicon.ico|fonts).*)",
};

export default auth(req => {
  const session = req.auth;

  const sessionNotFound = !session && req.nextUrl.pathname !== "/login";
  if (sessionNotFound) {
    const newUrl = new URL("/login", req.nextUrl.origin);
    return Response.redirect(newUrl);
  }

  const expiration = new Date(session?.credentials?.expiration ?? 0);
  const now = new Date();
  const sessionExpired = expiration < now;

  if (
    sessionExpired &&
    req.nextUrl.pathname !== "/logout" &&
    req.nextUrl.pathname !== "/login"
  ) {
    console.debug("access keys expired, redirect to /logout");
    const newUrl = new URL("/logout", req.nextUrl.origin);
    return Response.redirect(newUrl);
  }

  return NextResponse.next();
});
