import { NextResponse } from "next/server";
import { verifyToken } from "./utils/verifyToken.mjs";
import logOut from "./utils/logOut.mjs";
import { COOKIE_NAME } from "./constants/constantsName.mjs";

export async function middleware(request) {
  let token = request.cookies.get(COOKIE_NAME)?.value.split("Bearer")[1];
  const pathName = request.nextUrl.pathname;

  if (pathName.startsWith("/_next") || pathName.startsWith("/static")) {
    return NextResponse.next();
  }

  if (pathName === "/login" && token) {
    return NextResponse.redirect(new URL("/", request.url));
  }
  if (!token && pathName !== "/login") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  //   if (pathName.startsWith("/admin") && pathName !== "/admin/login") {
  //     if (!token) {
  //       return NextResponse.redirect(new URL("/admin/login", request.url));
  //     }
  //     const isAdmin = await verifyToken(token);

  //     if (!isAdmin) {
  //       await logOut();
  //       return NextResponse.redirect(new URL("/admin/login", request.url));
  //     }
  //   }
  return NextResponse.next();
}

export const config = {
  matcher: [
    // "/admin",
    // "/admin/:path*",
    // "/dashboard/:path*",
    "/:path*",
  ],
};
