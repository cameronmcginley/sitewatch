import { formatDistanceToNowStrict } from "date-fns";

export const toSentenceCase = (str) => {
  return str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : "";
};

export const handleShowDetails = (item) => {
  let details = `
    PK: ${item.pk?.S ?? "-"}
    SK: ${item.sk?.S ?? "-"}
    User ID: ${item.userid?.S ?? "-"}
    URL: ${item.url?.S ?? "-"}
    Check Type: ${item.check_type?.S ?? "-"}
    Delay (ms): ${item.delayMs?.S ?? "-"}
    Status: ${item.status?.S ?? "-"}
    Created At: ${item.createdAt?.S ?? "-"}
    Updated At: ${item.updatedAt?.S ?? "-"}
    Last Executed At: ${item.lastExecutedAt?.S ?? "-"}
    Last Result: ${item.lastResult ? JSON.stringify(item.lastResult.S) : "-"}
  `;

  // Add type-specific details
  switch (item.check_type?.S) {
    case "KEYWORD CHECK":
      details += `\nKeyword: ${item.keyword?.S ?? "-"}`;
      break;
    case "EBAY PRICE THRESHOLD":
      details += `
        Target Price: $${item.targetPrice?.N ?? "-"}
        Current Price: $${item.currentPrice?.N ?? "-"}
      `;
      break;
    case "PAGE DIFFERENCE":
      details += `\nDiff Percentage: ${item.diffPercentage?.N ?? "-"}%`;
      break;
  }

  alert(details);
};

// Bases next run date on lastExecutedAt + delayMs
export const getNextRunDate = (
  lastExecutedAt: string,
  delayMs: number
): Date | null => {
  if (!lastExecutedAt || !delayMs) return null;

  const lastExecutedDate = new Date(lastExecutedAt);

  if (isNaN(lastExecutedDate.getTime())) return null;

  return new Date(lastExecutedDate.getTime() + Number(delayMs));
};

export const isHappeningNow = (
  lastExecutedAt: string,
  delayMs: number
): boolean | null => {
  if (!lastExecutedAt || !delayMs) return false;

  const lastExecutedDate = new Date(lastExecutedAt);

  if (isNaN(lastExecutedDate.getTime())) return false;

  const nextRunDate = getNextRunDate(lastExecutedAt, delayMs);
  const now = new Date();
  return nextRunDate ? now >= nextRunDate : null;
};

export const formatDateWithTimezone = (date) => {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short",
  }).format(new Date(date));
};

export const getTimeAgo = (date: Date) => {
  return formatDistanceToNowStrict(new Date(date), { addSuffix: true });
};

export const formatFrequency = (milliseconds: number) => {
  const units = [
    { label: "month", value: 30 * 24 * 60 * 60 * 1000 },
    { label: "week", value: 7 * 24 * 60 * 60 * 1000 },
    { label: "day", value: 24 * 60 * 60 * 1000 },
    { label: "hour", value: 60 * 60 * 1000 },
    { label: "minute", value: 60 * 1000 },
  ];

  let remainingTime = milliseconds;
  const result: string[] = [];

  units.forEach((unit) => {
    const unitValue = Math.floor(remainingTime / unit.value);
    if (unitValue > 0) {
      result.push(`${unitValue} ${unit.label}${unitValue > 1 ? "s" : ""}`);
      remainingTime %= unit.value;
    }
  });

  return result.join(", ");
};
