import { NextResponse } from 'next/server';
import { withAuth } from "next-auth/middleware"

export default withAuth(
  function middleware(req) {
    if (!req.nextauth.token) {
      return NextResponse.redirect(new URL('/sign-in', req.url).toString());
    }
  },
)

export const config = { matcher: ["/test"]}