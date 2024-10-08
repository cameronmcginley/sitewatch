/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState } from "react";
import { HeroWavy } from "@/components/ui/hero-wavy";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";

const checks = [
  {
    name: "Keyword Check",
    description: "Check if a keyword exists (or doesn't exist) in the page.",
  },
  {
    name: "Page Difference",
    description:
      "Check if a page has changed since last check, choose any percentage of change.",
  },
  {
    name: "AI Check",
    description:
      "Provide a query with an alert condition, and we'll let AI determine if your condition is met.",
  },
  {
    name: "eBay Price Threshold",
    description: 'Check if an eBay "Buy it Now" price is below a threshold.',
  },
  {
    name: "Keyword Density Check",
    description:
      "Check if the density of a specific keyword on the page meets your desired threshold.",
  },
];

const signInClick = (session, status) => {
  if (status === "authenticated" && session.user.id) {
    window.location.href = "/app";
  } else {
    window.location.href = "/sign-in";
  }
};

function Root() {
  const [hoveredCheck, setHoveredCheck] = useState(null);
  const { data: session, status } = useSession();

  return (
    <>
      <div className="relative w-full">
        <HeroWavy />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center z-20 w-full max-w-5xl px-4 pb-16 md:pb-24">
          <h1 className="font-semibold text-2xl sm:text-3xl md:text-5xl text-white">
            Monitor Websites, Get Alerts
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-white mt-4 md:mt-8">
            SiteWatch checks your chosen sites, at your chosen interval, and
            sends you alerts when your conditions are met.
          </p>
          <p className="text-base sm:text-lg md:text-xl text-white mt-8 md:mt-12 mb-4">
            Upload any URL, then pick one of our custom check functions
          </p>
          <div className="flex flex-col md:flex-row flex-wrap justify-center gap-4 mt-4">
            {checks.map((check, index) => (
              <div
                key={check.name}
                className="w-full md:w-[calc(50%-1rem)] lg:w-[calc(33.33%-1rem)] relative"
                onMouseEnter={() => setHoveredCheck(index)}
                onMouseLeave={() => setHoveredCheck(null)}
              >
                <div
                  className={`bg-white rounded-xl transition-all duration-300 ease-in-out ${
                    hoveredCheck === index && "rounded-b-none"
                  } px-3 py-2 sm:px-4 sm:py-2 flex items-center justify-between`}
                >
                  <div className="flex items-center justify-center flex-grow">
                    <span className="text-blue-500 mr-2 font-semibold">✓</span>
                    <span className="text-gray-700 font-semibold text-sm sm:text-base">
                      {check.name}
                    </span>
                  </div>
                  <ChevronDown
                    size={16}
                    className={`text-gray-400 transition-transform duration-300 ${
                      hoveredCheck === index ? "rotate-180" : ""
                    }`}
                  />
                </div>
                <div
                  className={`absolute left-0 right-0 bg-white rounded-b-xl px-3 sm:px-4 overflow-hidden transition-all duration-300 ease-in-out shadow-lg z-30 ${
                    hoveredCheck === index
                      ? "opacity-100 max-h-40 py-2"
                      : "opacity-0 max-h-0"
                  }`}
                  style={{
                    top: "100%",
                    transform: `translateY(${
                      hoveredCheck === index ? "0" : "-10px"
                    })`,
                  }}
                >
                  <p className="text-gray-700 text-sm sm:text-base">
                    {check.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <Button
            className="mt-12 sm:mt-16 bg-white hover:bg-gray-200 text-gray-700 text-base sm:text-lg font-semibold px-6 py-4 sm:px-8 sm:py-6"
            onClick={() => signInClick(session, status)}
          >
            Get Started
          </Button>
        </div>
        {/* Demo section */}
        <div
          className="absolute top-full left-1/2 transform -translate-x-1/2 z-10 w-full max-w-5xl px-4"
          style={{ transform: "translate(-50%, -20%)" }}
        >
          <div className="relative">
            <img
              src="/demo.png"
              alt="download"
              className="rounded-2xl border-2 border-black w-full"
            />
            {/* Desktop buttons (hidden on mobile) */}
            <div
              className="absolute mt-16 sm:mt-24 top-1/4 left-1/2 transform -translate-x-1/2 hidden sm:block"
              style={{ transform: "translate(-50%, -130%)" }}
            >
              <div className="flex flex-col gap-4 bg-gray-900 p-4 rounded-xl">
                <Button className="p-4 sm:p-6" variant="outline">
                  Watch demo
                </Button>
                <Button
                  className="p-4 sm:p-6"
                  variant="outline"
                  onClick={() => {
                    window.open("/docs", "_blank");
                  }}
                >
                  Read Documentation
                </Button>
              </div>
            </div>
          </div>
          {/* Mobile buttons (visible on small screens) */}
          <div className="mt-4 flex flex-col gap-4 sm:hidden">
            <Button className="p-4" variant="default">
              Watch demo
            </Button>
            <Button
              className="p-4"
              variant="outline"
              onClick={() => {
                window.open("/docs", "_blank");
              }}
            >
              Read Documentation
            </Button>
          </div>
        </div>
      </div>
      {/* Below hero section */}
      <div className="w-full pt-48 sm:pt-32 mt-32 sm:mt-48 lg:mt-96 pb-16">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-12">
            <FeatureCard
              title="Run Checks Every 5 Minutes"
              description="Customize the frequency of your web checks, with options as frequent as every 5 minutes."
            />
            <FeatureCard
              title="Instant Alerts"
              description="Get instant email notifications the moment your conditions are met."
            />
            <FeatureCard
              title="Built for Performance"
              description="A resilient system that scales with its workload, using proxies to overcome blocks."
            />
          </div>

          <div className="text-center">
            <h3 className="text-xl sm:text-2xl font-semibold pt-6 sm:pt-8 mb-6 sm:mb-8">
              Ready to get started?
            </h3>
            <Button
              className="px-6 py-4 sm:px-8 sm:py-6 text-base sm:text-lg"
              variant="default"
              onClick={() => signInClick(session, status)}
            >
              {status === "authenticated" ? "Head to Application" : "Sign In"}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

function FeatureCard({ title, description }) {
  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
      <h3 className="text-lg sm:text-xl font-semibold mb-2">{title}</h3>
      <p className="text-sm sm:text-base text-gray-600">{description}</p>
    </div>
  );
}

export default Root;
