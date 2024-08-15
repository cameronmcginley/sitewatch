"use client";

import React, { useState } from "react";
import { HeroWavy } from "@/components/ui/hero-wavy";
import { ChevronDown } from "lucide-react";

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

function Root() {
  const [hoveredCheck, setHoveredCheck] = useState(null);

  return (
    <div className="relative w-full bg-[#4663ac]">
      <HeroWavy />
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center z-10 w-full max-w-4xl">
        <h1 className="font-semibold text-5xl text-white">
          Monitor Websites, Get Alerts
        </h1>
        <p className="text-xl text-white mt-8">
          Never miss a beat. SiteWatch checks your chosen sites and sends you
          alerts when your conditions are met.
        </p>
        <p className="text-xl text-white mt-24 mb-4">
          Pick any URL, then pick one of our custom check functions
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          {checks.map((check, index) => (
            <div
              key={check.name}
              className="w-[calc(33.33%-1rem)] min-w-[250px] relative"
              onMouseEnter={() => setHoveredCheck(index)}
              onMouseLeave={() => setHoveredCheck(null)}
            >
              <div
                className={`bg-white rounded-xl transition-all duration-300 ease-in-out ${
                  hoveredCheck === index && "rounded-b-none"
                } px-4 py-2 flex items-center justify-between`}
              >
                <div className="flex items-center">
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
                className={`absolute left-0 right-0 bg-white rounded-b-xl px-4 overflow-hidden transition-all duration-300 ease-in-out shadow-lg z-10 ${
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
    </div>
  );
}

export default Root;
