"use client";

import { useState, useEffect } from "react";
import { PlayIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getTimeUntilNext5Minutes } from "@/lib/checks/utils";

export const RunCheckButton = ({ checkData, handleRunNow, isUserAllowed }) => {
  const [isDisabled, setIsDisabled] = useState(!isUserAllowed);
  const [countdown, setCountdown] = useState(null);

  const handleClick = () => {
    if (!isUserAllowed) return;

    setIsDisabled(true);
    handleRunNow(checkData.pk, checkData.sk, checkData.userid);

    const { minutesToNextInterval, secondsToNextInterval } =
      getTimeUntilNext5Minutes();
    setCountdown({ minutesToNextInterval, secondsToNextInterval });

    setTimeout(() => {
      setIsDisabled(false);
      setCountdown(null);
    }, 5000);
  };

  useEffect(() => {
    if (countdown) {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev.secondsToNextInterval > 0) {
            return {
              ...prev,
              secondsToNextInterval: prev.secondsToNextInterval - 1,
            };
          } else if (prev.minutesToNextInterval > 0) {
            return {
              minutesToNextInterval: prev.minutesToNextInterval - 1,
              secondsToNextInterval: 59,
            };
          } else {
            clearInterval(timer);
            return null;
          }
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [countdown]);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="w-full">
            <Button
              className={`w-full ${isDisabled ? "opacity-50" : ""}`}
              variant="default"
              onClick={handleClick}
              disabled={isDisabled}
            >
              {countdown ? (
                `Will run in ${countdown.minutesToNextInterval}m ${countdown.secondsToNextInterval}s`
              ) : (
                <>
                  <PlayIcon className="mr-2 h-4 w-4" /> Run Check Now{" "}
                </>
              )}
            </Button>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>Will run at next 5 minute interval</p>
          {!isUserAllowed && (
            <p className="text-red-500">
              Must be a premium user to run manually
            </p>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
