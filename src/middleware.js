import { NextResponse } from "next/server";
import { verifyToken } from "./utils/verifyToken.mjs";
import logOut from "./utils/logOut.mjs";
import { COOKIE_NAME } from "./constants/constantsName.mjs";
import getActiveOrg from "./utils/getActiveOrg.mjs";

export async function middleware(request) {
  // return NextResponse.next();
  let token = request.cookies
    .get(COOKIE_NAME)
    ?.value?.split("Bearer")[1]
    ?.trim();
  const pathName = request.nextUrl.pathname;
  const activeOrg = await getActiveOrg();

  if (
    pathName !== "/login" &&
    pathName !== "/" &&     !pathName.includes("/api") &&
    !pathName.includes(activeOrg)
  ) {
    return NextResponse.redirect(new URL("/", request.url));
  }
  if (pathName === "/login" && token) {
    return NextResponse.redirect(new URL("/", request.url));
  }
  if (!token && pathName !== "/login") {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirectTo", pathName);
    return NextResponse.redirect(loginUrl);
  }

  if (pathName.includes("/api") && token) {
    const payload = await verifyToken(token);
    if (!payload || payload?.status !== "active") {
      await logOut();
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirectTo", pathName);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/login|api/logout|api/gets).*)",
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
  ],
};
