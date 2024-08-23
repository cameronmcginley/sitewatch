export type CheckType =
  | "KEYWORD CHECK"
  | "EBAY PRICE THRESHOLD"
  | "PAGE DIFFERENCE";

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
}
export interface CheckItem {
  alias: string;
  check_type: CheckType;
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

// export type AttributesForCheckType<T extends CheckType> =
//   CheckItemAttributes[T];
