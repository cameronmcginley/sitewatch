import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface LoadingOverlayProps {
  mainText: string;
  subText: string;
}

export const LoadingOverlay = ({ mainText, subText }: LoadingOverlayProps) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((oldProgress) => {
        if (oldProgress === 100) {
          return 0;
        }
        const diff = Math.random() * 15 + 5;
        return Math.min(oldProgress + diff, 100);
      });
    }, 600);

    return () => {
      clearInterval(timer);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center">
      <div className="absolute inset-0 bg-background/80" />
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="relative z-100 bg-white text-black border border-gray-200 rounded-lg shadow-lg p-6 max-w-sm w-full mx-4"
      >
        <h2 className="text-2xl font-bold text-foreground mb-4">{mainText}</h2>
        <p className="text-muted-foreground mb-6">{subText}</p>
        <div className="relative pt-1">
          <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-secondary">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
              className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary"
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
};
