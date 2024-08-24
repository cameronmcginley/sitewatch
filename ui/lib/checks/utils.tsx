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

export const getTimeAgo = (date: Date | string) => {
  return formatDistanceToNowStrict(new Date(date), { addSuffix: true });
};

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

export const convertToCron = (
  intervalMs: number,
  hoursOffset: number = 0,
  dayOfWeek?: string
): string => {
  const minutes = 0; // Always set to 0 as per requirement
  const hours = hoursOffset;
  const dayOfWeekExpression = dayOfWeek || "0";

  if (intervalMs > 604800000) {
    // Greater than weekly, default to weekly
    return `${minutes} ${hours} * * ${dayOfWeekExpression}`;
  } else if (intervalMs === 604800000) {
    // Weekly
    return `${minutes} ${hours} * * ${dayOfWeekExpression}`;
  } else if (intervalMs === 86400000) {
    // Daily
    return `${minutes} ${hours} * * *`;
  } else if (intervalMs === 43200000) {
    // Twice daily (every 12 hours)
    return `${minutes} ${hours},${(hours + 12) % 24} * * *`;
  } else if (intervalMs === 14400000) {
    // Every 4 hours
    return `${minutes} ${hours},${(hours + 4) % 24},${(hours + 8) % 24},${
      (hours + 12) % 24
    },${(hours + 16) % 24},${(hours + 20) % 24} * * *`;
  } else if (intervalMs >= 3600000) {
    // Hourly or more (but less than daily)
    const intervalHours = Math.floor(intervalMs / 3600000);
    return `${minutes} */${intervalHours} * * *`;
  } else {
    // Less than hourly, use minute intervals
    const intervalMinutes = Math.max(1, Math.floor(intervalMs / 60000));
    return `*/${intervalMinutes} * * * *`;
  }
};

export const getNextRunTimeFromCron = (cron: string): Date => {
  const options = {
    currentDate: new Date(),
    utc: true,
  };

  const interval = cronParser.parseExpression(cron, options);
  const nextRunDate = interval.next().toDate();

  return nextRunDate;
};

export const getTimeUntilNext5Minutes = () => {
  const now = new Date();
  const minutes = now.getMinutes();
  const seconds = now.getSeconds();

  const minutesToNextInterval = 4 - (minutes % 5);
  const secondsToNextInterval = 60 - seconds;

  return { minutesToNextInterval, secondsToNextInterval };
};
