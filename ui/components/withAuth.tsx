import { useSession, signIn } from "next-auth/react";
import { useEffect } from "react";

const withAuth = (WrappedComponent) => {
  return (props) => {
    const { data: session, status } = useSession();

    useEffect(() => {
      if (status === "unauthenticated") {
        signIn().catch((error) => {
          console.error("Sign-in error:", error);
        });
      }
    }, [status]);

    if (status === "loading") {
      return <div>Loading...</div>;
    }

    if (status === "authenticated") {
      return <WrappedComponent {...props} />;
    }

    return null;
  };
};

export default withAuth;
