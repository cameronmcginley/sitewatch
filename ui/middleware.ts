import { NextResponse } from "next/server";
import { auth } from "@/auth"; // Import from your new auth.ts file
import { SIGN_IN_URL } from "@/lib/constants";

export default async function middleware(req) {
  const token = await auth(req); // Get the authentication token

  if (!token) {
    return NextResponse.redirect(new URL(SIGN_IN_URL, req.url).toString());
  }

  // If token exists, allow the request to proceed
  return NextResponse.next();
}

// Matcher configuration
export const config = { matcher: ["/((?!$|sign-in).*)"] };
