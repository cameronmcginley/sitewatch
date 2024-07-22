import {
  formatDistanceToNowStrict,
  formatDuration,
  intervalToDuration,
} from "date-fns";
import cronParser from "cron-parser";
import cronstrue from "cronstrue";

export const msToTimeStr = (ms: number): string => {
  const duration = intervalToDuration({ start: 0, end: ms });

  const formattedDuration = formatDuration(duration, {
    format: ["weeks", "days", "hours", "minutes"],
  });

  return formattedDuration;
};

export const cronToPlainText = (cronExpression: string): string => {
  try {
    return cronstrue.toString(cronExpression, { verbose: false, tzOffset: 0 });
  } catch (err) {
    console.error("Error parsing cron expression:", err);
    return "Invalid cron expression";
  }
};

export const toSentenceCase = (str: string) => {
  return str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : "";
};

export const handleShowDetails = (item: any) => {
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

export const getNextRunTimeFromCron = (cronString: string): Date => {
  const options = {
    currentDate: new Date(),
    utc: true,
  };

  const interval = cronParser.parseExpression(cronString, options);
  const nextRunDate = interval.next().toDate();

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

export const isHappeningNowFromCron = (
  lastExecutedAt: string,
  cronExpression: string
): boolean | null => {
  try {
    const interval = cronParser.parseExpression(cronExpression);
    const nextRunDate = interval.next().toDate();
    const lastExecutedDate = new Date(lastExecutedAt);

    return (
      new Date(nextRunDate.getTime() - lastExecutedDate.getTime()) >
      lastExecutedDate
    );
  } catch (err) {
    console.error("Error parsing cron expression:", err);
    return null;
  }
};

export const getTimeAgo = (date: Date) => {
  return formatDistanceToNowStrict(new Date(date), { addSuffix: true });
};

export const getTimeZone = () =>
  Intl.DateTimeFormat().resolvedOptions().timeZone;

export const formatDateWithTimezone = (date: any) => {
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

export const convertDelayToCron = (
  delay: string,
  hourOffset?: number
): string => {
  const timeUnitToCron = (
    value: number,
    unit: string,
    hour: number = 0,
    minute: number = 0
  ): string => {
    switch (unit) {
      case "minute":
      case "minutes":
        return `*/${value} * * * *`;
      case "hour":
      case "hours":
        return `${minute} */${value} * * *`;
      case "day":
      case "days":
        return `${minute} ${hour} */${value} * *`;
      case "week":
      case "weeks":
        return `${minute} ${hour} * * ${value % 7}`;
      default:
        throw new Error("Unsupported time unit");
    }
  };

  const regex = /(\d+)\s*(minute|minutes|hour|hours|day|days|week|weeks)/;
  const match = delay.match(regex);

  if (!match) {
    throw new Error("Invalid delay format");
  }

  const value = parseInt(match[1], 10);
  const unit = match[2].toLowerCase();

  let hour = 0;
  let minute = 0;

  if (unit === "hour" || unit === "hours") {
    if (hourOffset === undefined) {
      throw new Error("Hour offset must be specified for delays over 1 hour");
    }
    minute = 0;
  } else if (
    unit === "day" ||
    unit === "days" ||
    unit === "week" ||
    unit === "weeks"
  ) {
    if (hourOffset === undefined) {
      throw new Error(
        "Hour offset must be specified for daily or weekly delays"
      );
    }
    hour = hourOffset;
  }

  return timeUnitToCron(value, unit, hour, minute);
};

export const convertToCron = (
  frequency: number,
  offset?: number,
  dayOfWeek?: string
): string => {
  const minutes = 0; // Always start at the 0th minute for simplicity
  const hours = offset || 0; // Offset is now the hours offset
  const days = dayOfWeek || "0"; // Use Sunday if dayOfWeek is not specified

  if (frequency === 604800000) {
    // 1 week
    return `${minutes} ${hours} ? * ${days} *`;
  } else if (frequency === 86400000) {
    // 1 day
    return `${minutes} ${hours} ? * * *`;
  } else if (frequency === 43200000) {
    // 12 hours
    return `${minutes} ${hours}-23/12 ? * * *`;
  } else if (frequency === 14400000) {
    // 4 hours
    return `${minutes} ${hours}-23/4 ? * * *`;
  } else {
    // Less than 4 hours, use minute intervals
    const intervalMinutes = frequency / 60000;
    return `*/${intervalMinutes} * * * ? *`;
  }
};
