import React from "react";
import { ThreeDots } from "react-loader-spinner";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { BADGE_COLOR_CLASS } from "@/lib/constants";

export const checkTypeDescriptions = {
  "KEYWORD CHECK": "Check if a keyword exists in the page",
  "EBAY PRICE THRESHOLD":
    'Check if an eBay "Buy it Now" price is below a threshold',
  "PAGE DIFFERENCE": "Check if a page has changed",
  "AI CHECK": "Given a prompt, check if a model detects a condition",
};

export const loadingDots = (
  <ThreeDots
    visible={true}
    height="40"
    width="40"
    color="#000"
    radius="9"
    ariaLabel="three-dots-loading"
    wrapperStyle={{}}
    wrapperClass=""
  />
);

export const emptyDash = (
  <Badge className={cn(BADGE_COLOR_CLASS.GRAY, "px-2.5 py-0.5")} />
);
