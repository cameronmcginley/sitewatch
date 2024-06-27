"use client";

import { useSession, signIn } from "next-auth/react";
import { useEffect } from "react";
import { useRouter } from "next/router";
import { SIGN_IN_URL } from "@/lib/constants";

const withAuth = (
  WrappedComponent: React.ComponentType,
  publicRoutes: string[] = []
) => {
  return (props) => {
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
      if (status === "loading") {
        // Show a loading spinner or nothing
        return;
      }

      if (!session && !publicRoutes.includes(router.pathname)) {
        router.push(SIGN_IN_URL);
      }
    }, [session, status, router.pathname]);

    if (
      status === "loading" ||
      (!session && !publicRoutes.includes(router.pathname))
    ) {
      return (
        <div className="h-10 w-10 bg-gray-200 rounded-full animate-pulse"></div>
      ); // Loading state
    }

    return <WrappedComponent {...props} />;
  };
};

export default withAuth;
