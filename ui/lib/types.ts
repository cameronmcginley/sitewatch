export type CheckType =
  | "KEYWORD CHECK"
  | "EBAY PRICE THRESHOLD"
  | "PAGE DIFFERENCE"
  | "AI CHECK";

export type CheckStatus = "ACTIVE" | "PAUSED";
export const CHECK_STATUS_VALUES: CheckStatus[] = ["ACTIVE", "PAUSED"];
export type LastResultStatus = "ALERTED" | "NO ALERT" | "FAILED";

export interface CheckItemAttributes {
  "KEYWORD CHECK": {
    keyword: string;
    opposite: boolean;
  };
  "EBAY PRICE THRESHOLD": {
    threshold: number;
  };
  "PAGE DIFFERENCE": {
    percent_diff: number;
  };
  "AI CHECK": {
    userPrompt: string;
    userCondition: string;
    model: string;
  };
}
export interface CheckItem {
  alias: string;
  checkType: CheckType;
  pk: string;
  sk: string;
  type: string;
  url: string;
  userid: string;
  createdAt: string;
  updatedAt: string;
  lastResult: {
    status: LastResultStatus;
    message: string;
    timestamp: string;
  };
  status: CheckStatus;
  delayMs: number;
  email: string;
  mostRecentAlert?: string;
  cron: string;
  attributes: CheckItemAttributes[CheckType];
}
