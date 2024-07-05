import React from "react";
import { ThreeDots } from "react-loader-spinner";
import { Badge } from "@/components/ui/badge";

export const check_type_descriptions = {
  "KEYWORD CHECK": "Check if a keyword exists in the page",
  "EBAY PRICE THRESHOLD":
    'Check if an eBay "Buy it Now" price is below a threshold',
  "PAGE DIFFERENCE": "Check if a page has changed",
};

export const loadingDots = (
  <ThreeDots
    visible={true}
    height="40"
    width="40"
    color="#fff"
    radius="9"
    ariaLabel="three-dots-loading"
    wrapperStyle={{}}
    wrapperClass=""
  />
);

export const emptyDash = (
  <Badge className="bg-gray-700 hover:bg-gray-700 px-2.5 py-0.5" />
);
