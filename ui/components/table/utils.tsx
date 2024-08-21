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

export const getNextRunDate = (startHour: string, delayMs: number): Date => {
  const now = new Date();
  let nextRunDate = new Date(now);
  nextRunDate.setUTCHours(Number(startHour), 0, 0, 0);

  while (nextRunDate <= now) {
    nextRunDate = new Date(nextRunDate.getTime() + delayMs);
  }

  return nextRunDate;
};

// export const getNextRunTimeFromCron = (cronString: string): Date => {
//   const options = {
//     currentDate: new Date(),
//     utc: true,
//   };

//   const interval = cronParser.parseExpression(cronString, options);
//   const nextRunDate = interval.next().toDate();

//   return nextRunDate;
// };

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

// export const convertToCron = (
//   frequency: number,
//   offset?: number,
//   dayOfWeek?: string
// ): string => {
//   const minutes = 0; // Always start at the 0th minute for simplicity
//   const hours = offset || 0; // Offset is now the hours offset
//   const days = dayOfWeek || "0"; // Use Sunday if dayOfWeek is not specified

//   if (frequency === 604800000) {
//     // 1 week
//     return `${minutes} ${hours} ? * ${days} *`;
//   } else if (frequency === 86400000) {
//     // 1 day
//     return `${minutes} ${hours} ? * * *`;
//   } else if (frequency === 43200000) {
//     // 12 hours
//     return `${minutes} ${hours}-23/12 ? * * *`;
//   } else if (frequency === 14400000) {
//     // 4 hours
//     return `${minutes} ${hours}-23/4 ? * * *`;
//   } else {
//     // Less than 4 hours, use minute intervals
//     const intervalMinutes = frequency / 60000;
//     return `*/${intervalMinutes} * * * ? *`;
//   }
// };

// export const convertToCron = (
//   intervalMs: number,
//   hoursOffset: number = 0,
//   dayOfWeek?: string
// ): string => {
//   const minutes = 0; // Always set to 0 as per requirement
//   const hours = hoursOffset;
//   const dayOfWeekExpression = dayOfWeek || "?"; // Use ? as default for AWS compatibility

//   if (intervalMs === 604800000) {
//     // Weekly
//     return `cron(${minutes} ${hours} ? * ${dayOfWeekExpression} *)`;
//   } else if (intervalMs === 86400000) {
//     // Daily
//     return `cron(${minutes} ${hours} * ? * *)`;
//   } else if (intervalMs === 43200000) {
//     // Twice daily (every 12 hours)
//     return `cron(${minutes} ${hours},${(hours + 12) % 24} * ? * *)`;
//   } else if (intervalMs === 14400000) {
//     // Every 4 hours
//     return `cron(${minutes} ${hours},${(hours + 4) % 24},${(hours + 8) % 24},${
//       (hours + 12) % 24
//     },${(hours + 16) % 24},${(hours + 20) % 24} * ? * *)`;
//   } else if (intervalMs >= 3600000) {
//     // Hourly or more (but less than daily)
//     const intervalHours = intervalMs / 3600000;
//     return `cron(${minutes} */${intervalHours} * ? * *)`;
//   } else {
//     // Less than hourly, use minute intervals
//     const intervalMinutes = Math.max(1, intervalMs / 60000);
//     return `cron(*/${Math.floor(intervalMinutes)} * * ? * *)`;
//   }
// };

// export const parseAWSCron = (awsCronString: string): string => {
//   const cronContent = awsCronString;

//   // Split the cron string into its components
//   const [minute, hour, dayOfMonth, month, dayOfWeek, year] =
//     cronContent.split(" ");

//   // Replace '?' with '*' for compatibility with cron-parser
//   const parsableCron = `${minute} ${hour} ${
//     dayOfMonth === "?" ? "*" : dayOfMonth
//   } ${month} ${dayOfWeek === "?" ? "*" : dayOfWeek}`;

//   return parsableCron;
// };

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

export const getNextRunTimeFromCron = (awsCronString: string): Date => {
  const options = {
    currentDate: new Date(),
    utc: true,
  };

  const interval = cronParser.parseExpression(awsCronString, options);
  const nextRunDate = interval.next().toDate();

  return nextRunDate;
};
