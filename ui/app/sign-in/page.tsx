"use client";

import { getProviders, signIn } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function SignIn() {
  const searchParams = useSearchParams();
  const [providers, setProviders] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
  const handleSignIn = async (providerId) => {
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
          <div key={provider.name}>
            <button onClick={() => handleSignIn(provider.id)}>
              Sign in with {provider.name}
            </button>
          </div>
        ))
      ) : (
        <div>No providers found</div>
      )}
    </div>
  );
}
