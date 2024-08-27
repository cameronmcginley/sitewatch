"use client";

import { getProviders, signIn } from "next-auth/react";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { HeroWavy } from "@/components/ui/hero-wavy";

const ProviderSvgs = {
  Google: (
    <svg
      className="w-5 h-5"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  ),
};

interface SignInBaseComponentProps {
  children?: React.ReactNode;
}

const SignInBaseComponent = ({ children }: SignInBaseComponentProps) => {
  return (
    <div className="flex items-start pt-36 justify-center min-h-full w-full bg-gradient-to-br from-blue-50 to-blue-100">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 max-w-md w-full">
        <div className="flex flex-col items-center space-y-6">
          <h2 className="mb-2 text-2xl font-bold text-center text-gray-800 dark:text-white">
            Welcome to SiteWatch
          </h2>
          {children}
        </div>
      </div>
    </div>
  );
};

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
    return <SignInBaseComponent />;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <SignInBaseComponent>
      {providers ? (
        Object.values(providers).map((provider) => (
          <Button
            className="w-full max-w-xs bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4 border border-gray-400 rounded shadow flex items-center justify-center space-x-2 transition-colors duration-300"
            onClick={() => handleSignIn((provider as any).id)}
            key={(provider as any).name}
          >
            {ProviderSvgs[(provider as any).name]}
            <span>Sign in with {(provider as any).name}</span>
          </Button>
        ))
      ) : (
        <div>No providers found</div>
      )}
    </SignInBaseComponent>
  );
}

export default function SignIn() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SignInComponent />
    </Suspense>
  );
}
