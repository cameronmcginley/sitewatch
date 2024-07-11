import {
  formatDistanceToNowStrict,
  formatDuration,
  intervalToDuration,
} from "date-fns";

export const msToTimeStr = (ms: number): string => {
  const duration = intervalToDuration({ start: 0, end: ms });

  const formattedDuration = formatDuration(duration, {
    format: ["weeks", "days", "hours", "minutes"],
  });

  return formattedDuration;
};

export const toSentenceCase = (str: string) => {
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

export const getNextRunDate = (startHour: string, delayMs: number): Date => {
  const now = new Date();
  let nextRunDate = new Date(now);
  nextRunDate.setUTCHours(Number(startHour), 0, 0, 0);

  while (nextRunDate <= now) {
    nextRunDate = new Date(nextRunDate.getTime() + delayMs);
  }

  return nextRunDate;
};

export const isHappeningNow = (
  lastExecutedAt: string,
  startHour: string,
  delayMs: number
): boolean | null => {
  const nextRunDate = getNextRunDate(startHour, delayMs);

  // If distance to nextRunDate is greater than lastExecutedAt + delayMs, then an execution should be happening now
  const lastExecutedDate = new Date(lastExecutedAt);

  return nextRunDate
    ? new Date(nextRunDate.getTime() - delayMs) > lastExecutedDate
    : null;
};

export const getTimeAgo = (date: Date) => {
  return formatDistanceToNowStrict(new Date(date), { addSuffix: true });
};

export const getTimeZone = () =>
  Intl.DateTimeFormat().resolvedOptions().timeZone;

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

export const formatTimeWithTimezone = (hour: number): string => {
  const now = new Date();
  const utcDate = new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
      hour,
      0,
      0
    )
  );

  return utcDate.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "numeric",
    hour12: true,
    timeZone: getTimeZone(),
    timeZoneName: "short",
  });
};
