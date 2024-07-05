"use client";

import React from "react";
import { FlipWords } from "@/components/ui/flip-words";
import { motion } from "framer-motion";
import { HeroHighlight, Highlight } from "@/components/ui/hero-highlight";

function Root() {
  // const words = ["monitoring", "scraping", "alerting", "testing"];
  const words = ["page changes", "keyword detection", "price thresholds"];

  return (
    <>
      <HeroHighlight className="w-max">
        <motion.h1
          initial={{
            opacity: 80,
            y: 20,
          }}
          animate={{
            opacity: 1,
            y: [20, -5, 0],
          }}
          transition={{
            duration: 0.5,
            ease: [0.4, 0.0, 0.2, 1],
          }}
          className="text-2xl px-4 md:text-4xl lg:text-7xl font-semibold max-w-4xl lg:leading-snug text-center mx-auto"
        >
          Web alerting made easy
          <div className="text-3xl mt-6 transition transform duration-500 ">
            For any URL, get notified on
            <FlipWords
              className="w-max pl-3 !text-blue-500"
              duration={2500}
              words={words}
            />
          </div>
        </motion.h1>
      </HeroHighlight>
    </>
  );
}

export default Root;
