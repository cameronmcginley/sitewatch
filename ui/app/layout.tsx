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
      <html lang="en" className="dark">
        <body className={`h-screen`}>
          <main className="flex flex-col items-center w-full">
            <Navbar />
            <div className="max-w-7xl w-full p-6 pt-12">{children}</div>
          </main>
        </body>
      </html>
    </ClientSessionProvider>
  );
}
