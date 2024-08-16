import "./globals.css";
import React from "react";
import Navbar from "@/components/sections/Navbar";
import ClientSessionProvider from "@/lib/ClientSessionProvider";
import Footer from "@/components/sections/Footer";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClientSessionProvider>
      <html lang="en">
        <body className="h-screen flex flex-col justify-between">
          <main className="flex flex-col items-center w-full flex-grow">
            <Navbar />
            {children}
          </main>
          <Footer />
        </body>
      </html>
    </ClientSessionProvider>
  );
}
