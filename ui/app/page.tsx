/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useEffect, useState } from "react";
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
  // If already signed in, redirect to dashboard
  if (status === "authenticated" && session.user.id) {
    window.location.href = "/test";
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
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center z-20 w-full max-w-5xl px-4 pb-24">
          <h1 className="font-semibold text-3xl md:text-5xl text-white">
            Monitor Websites, Get Alerts
          </h1>
          <p className="text-lg md:text-xl text-white mt-4 md:mt-8">
            Never miss a beat. SiteWatch checks your chosen sites and sends you
            alerts when your conditions are met.
          </p>
          <p className="text-lg md:text-xl text-white mt-12 md:mt-24 mb-4">
            Pick any URL, then pick one of our custom check functions
          </p>
          <div className="flex flex-col md:flex-row flex-wrap justify-center gap-4">
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
                  } px-4 py-2 flex items-center justify-between`}
                >
                  <div className="flex items-center justify-center flex-grow">
                    <span className="text-blue-500 mr-2 font-semibold">✓</span>
                    <span className="text-gray-700 font-semibold">
                      {check.name}
                    </span>
                  </div>
                  <ChevronDown
                    size={20}
                    className={`text-gray-400 transition-transform duration-300 ${
                      hoveredCheck === index ? "rotate-180" : ""
                    }`}
                  />
                </div>
                <div
                  className={`absolute left-0 right-0 bg-white rounded-b-xl px-4 overflow-hidden transition-all duration-300 ease-in-out shadow-lg z-30 ${
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
                  <p className="text-gray-700">{check.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Demo section */}
        <div
          className="absolute top-full left-1/2 transform -translate-x-1/2 z-10 w-full max-w-5xl px-4"
          style={{ transform: "translate(-50%, -30%)" }}
        >
          <div className="relative">
            <img
              src="/download2.png"
              alt="download"
              className="rounded-2xl border-2 border-black w-full"
            />
            {/* Desktop buttons (hidden on mobile) */}
            <div
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 hidden md:block"
              style={{ transform: "translate(-50%, -130%)" }}
            >
              <div className="flex flex-col gap-4 bg-opacity-20 bg-black p-4 rounded-2xl">
                <Button className="p-6" variant="default">
                  Watch demo
                </Button>
                <Button className="p-6" variant="outline">
                  Read Documentation
                </Button>
              </div>
            </div>
          </div>
          {/* Mobile buttons (hidden on desktop) */}
          <div className="mt-4 flex flex-col gap-4 md:hidden">
            <Button className="p-4" variant="default">
              Watch demo
            </Button>
            <Button className="p-4" variant="outline">
              Read Documentation
            </Button>
          </div>
        </div>
      </div>
      {/* Below hero section */}
      <div className="w-full pt-24 mt-48 lg:mt-96 pb-16">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
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
            <h3 className="text-2xl font-semibold pt-8 mb-8">
              Ready to get started?
            </h3>
            <Button
              className="px-8 py-6 text-lg"
              variant="default"
              onClick={() => signInClick(session, status)}
            >
              Sign In
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

function FeatureCard({ title, description }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

export default Root;
