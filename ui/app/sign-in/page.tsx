"use client";

import { getProviders, signIn } from "next-auth/react";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";

function SignInComponent() {
  const searchParams = useSearchParams();
  const [providers, setProviders] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const fetchProviders = async () => {
      try {
        const res = await getProviders();
        setProviders(res);
      } catch (err) {
        setError("Failed to load providers");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProviders();
  }, []);

  // Function to handle sign-in with callback URL
  const handleSignIn = async (providerId: any) => {
    const signInResponse = await signIn(providerId, {
      callbackUrl: searchParams.get("callbackUrl") || "/", // Default callback URL if not provided
    });

    if (signInResponse?.error) {
      setError("Sign in failed");
      console.error(signInResponse.error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div>
      {providers ? (
        Object.values(providers).map((provider) => (
          <div key={(provider as any).name}>
            <button onClick={() => handleSignIn((provider as any).id)}>
              Sign in with {(provider as any).name}
            </button>
          </div>
        ))
      ) : (
        <div>No providers found</div>
      )}
    </div>
  );
}

export default function SignIn() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SignInComponent />
    </Suspense>
  );
}
