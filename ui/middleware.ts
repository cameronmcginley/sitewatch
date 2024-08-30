import { NextResponse } from "next/server";
import { withAuth } from "next-auth/middleware";

export default withAuth(function middleware(req) {
  if (!req.nextauth.token) {
    return NextResponse.redirect(new URL("/sign-in", req.url).toString());
  }
});

// Exclude static files, images, API routes, and allow the root `/` route
export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|sign-in|docs|public|$|demo.png).*)",
  ],
};
