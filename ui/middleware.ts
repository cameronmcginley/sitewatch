import { NextResponse } from 'next/server';
import { withAuth } from "next-auth/middleware"
import { SIGN_IN_URL } from "@/lib/constants";

export default withAuth(
  function middleware(req) {
    if (!req.nextauth.token) {
      return NextResponse.redirect(new URL(SIGN_IN_URL, req.url).toString());
    }
  },
)

// / becomes $
export const config = { matcher: ["/((?!$|sign-in).*)"],}