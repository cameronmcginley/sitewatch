import "../globals.css";
import React from "react";
import Navbar from "@/components/sections/Navbar";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* <Navbar /> */}
      <div className="w-9/12 w-full p-6 pt-12">{children}</div>
    </>
  );
}
