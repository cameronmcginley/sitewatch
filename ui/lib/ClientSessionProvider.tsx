"use client";

import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

export default function ClientSessionProvider({ children }: Props) {
  return <SessionProvider>{children}</SessionProvider>;
}
