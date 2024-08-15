"use client";

import React, { useState } from "react";
import { HeroWavy } from "@/components/ui/hero-wavy";

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
    <>
      <div
        style={{
          position: "relative",
          width: "100%",
          backgroundColor: "#4663ac",
        }}
      >
        <HeroWavy />
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            textAlign: "center",
            zIndex: 10,
          }}
        >
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
          <div
            className="flex justify-center mt-2 flex-wrap"
            style={{ maxWidth: "800px", margin: "0 auto" }} // Added max-width and centered the container
          >
            {checks.map((check, index) => (
              <div
                key={check.name}
                className="relative flex flex-row items-center justify-center text-center bg-white rounded-full px-4 py-1 m-2"
                style={{ width: "calc(33.3333% - 16px)" }} // Adjust width to ensure 3 items per row
                onMouseEnter={() => setHoveredCheck(index)}
                onMouseLeave={() => setHoveredCheck(null)}
              >
                <span className="text-blue-500 mr-2 font-semibold">✓</span>
                <span className="text-gray-700 font-semibold">
                  {check.name}
                </span>
                {hoveredCheck === index && (
                  <div
                    className="absolute items-center border border-1 border-[#4d69ad] bg-white rounded-lg px-4 py-2 shadow-lg w-72"
                    style={{
                      top: "calc(100% + 10px)", // Position the popup below
                      left: "50%",
                      transform: "translateX(-50%)",
                      zIndex: 20, // Ensure the hover box is on top
                    }}
                  >
                    <p className="text-gray-700">{check.description}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

export default Root;
