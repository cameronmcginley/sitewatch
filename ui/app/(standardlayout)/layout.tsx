import React from "react";
import Navbar from "@/components/sections/Navbar";
import HeroWavy from "@/components/ui/hero-wavy";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* <Navbar /> */}
      <div className="w-full">
        <HeroWavy height={20} />
      </div>
      <div className="w-9/12 w-full p-6 pt-12">{children}</div>
    </>
  );
}
