export interface CheckItem {
  alias: string;
  check_type: string;
  pk: string;
  sk: string;
  type: string;
  url: string;
  userid: string;
  createdAt: string;
  updatedAt: string;
  lastResult: {
    status: "ALERTED" | "NO ALERT" | "FAILED";
    message: string;
    timestamp: string;
  };
  status: "ACTIVE" | "PAUSED";
  delayMs: number;
  email: string;
  mostRecentAlert?: string;
  cron: string;
  attributes: Partial<{
    keyword: string;
    opposite: boolean;
    threshold: number;
    percent_diff: number;
  }>;
}

// Helper type to extract check types
export type CheckType = CheckItem["check_type"];

// Helper type to get attributes for a specific check type
export type AttributesForCheckType<T extends CheckType> = Extract<
  CheckItem,
  { check_type: T }
>["attributes"];

// Define types for statuses
export type CheckStatus = "ACTIVE" | "PAUSED";
export type LastResultStatus = "ALERTED" | "NO ALERT" | "FAILED";
