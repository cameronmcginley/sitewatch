// "use client";

// import { useSession } from "next-auth/react";
// import { useRouter, usePathname } from "next/navigation";
// import { useEffect, ReactNode } from "react";
// import { PUBLIC_ROUTES } from "./constants";

// interface WithAuthProps {
//   children: ReactNode;
// }

// export const withAuth = (
//   WrappedComponent: React.ComponentType<WithAuthProps>
// ) => {
//   const ComponentWithAuth = (props: WithAuthProps) => {
//     const { data: session, status } = useSession();
//     const router = useRouter();
//     const pathname = usePathname();

//     useEffect(() => {
//       if (status === "loading") return;

//       if (!session && !PUBLIC_ROUTES.includes(pathname)) {
//         router.push("/sign-in");
//       }
//     }, [session, status, pathname, router]);

//     if (
//       status === "loading" ||
//       (!session && !PUBLIC_ROUTES.includes(pathname))
//     ) {
//       return (
//         <div className="h-10 w-10 bg-gray-200 rounded-full animate-pulse"></div>
//       );
//     }

//     return <WrappedComponent {...props} />;
//   };

//   return ComponentWithAuth;
// };
