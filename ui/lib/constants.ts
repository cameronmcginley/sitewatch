import type { CheckType, CheckItem } from "./types";

export const unknownError =
  "An unknown error occurred. Please try again later.";

export const databasePrefix = "shadcn";

export const SIGN_IN_URL = "/sign-in";

// When adding, add to middleware.ts also
// Can not be dynamic or import at all
export const PUBLIC_ROUTES: string[] = ["/", SIGN_IN_URL];

export const CHECK_TYPES: CheckType[] = [
  "KEYWORD CHECK",
  "EBAY PRICE THRESHOLD",
  "PAGE DIFFERENCE",
];

export const CHECK_TYPE_ATTRIBUTES: {
  [K in CheckType]: Array<
    keyof Extract<CheckItem, { check_type: K }>["attributes"]
  >;
} = {
  "KEYWORD CHECK": ["keyword", "opposite"],
  "EBAY PRICE THRESHOLD": ["threshold"],
  "PAGE DIFFERENCE": ["percent_diff"],
};

export const BADGE_COLOR_CLASS: Record<string, string> = {
  GREEN: "bg-green-700 text-white hover:bg-green-700",
  YELLOW: "bg-yellow-700 text-white hover:bg-yellow-700",
  RED: "bg-red-700 text-white hover:bg-red-700",
  GRAY: "bg-gray-700 text-white hover:bg-gray-700",
};
