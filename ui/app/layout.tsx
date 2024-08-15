import "./globals.css";
import React from "react";
import Navbar from "@/components/sections/Navbar";
import ClientSessionProvider from "@/lib/ClientSessionProvider";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClientSessionProvider>
      <html lang="en">
        <body className={`h-screen`}>
          <main className="flex flex-col items-center w-full">
            <Navbar />
            {children}
          </main>
        </body>
      </html>
    </ClientSessionProvider>
  );
}
