export const unknownError = "An unknown error occurred. Please try again later."

export const databasePrefix = "shadcn"

export const SIGN_IN_URL = "/sign-in"

// When adding, add to middleware.ts also
// Can not be dynamic or import at all
export const PUBLIC_ROUTES: string[] = ["/", SIGN_IN_URL]

export const CHECK_TYPES: string[] = ["KEYWORD CHECK", "EBAY PRICE THRESHOLD", "PAGE DIFFERENCE"]

export const CHECK_TYPE_ATTRIBUTES: Record<string, string[]> = {
    "KEYWORD CHECK": ["keyword", "opposite"],
    "EBAY PRICE THRESHOLD": ["threshold"],
    "PAGE DIFFERENCE": ["percent_diff"],
    }

export const DATA_FIELDS_WITH_TYPES: Record<string, string> = {
    "userid": "S",
    "check_type": "S",
    "url": "S",
    "delayMs": "N",
    "status": "S",
    "createdAt": "S",
    "updatedAt": "S",
    "lastExecutedAt": "S",
    "lastResult": "S",
    "attributes": "M",
    "keyword": "S",
    "opposite": "B",
    "threshold": "N",
    "percent_diff": "N",
}

export const BADGE_COLOR_CLASS: Record<string, string> = {
    GREEN: "bg-green-700 text-white hover:bg-green-700",
    YELLOW: "bg-yellow-700 text-white hover:bg-yellow-700",
    RED: "bg-red-700 text-white hover:bg-red-700",
    GRAY: "bg-gray-700 text-white hover:bg-gray-700",
  };