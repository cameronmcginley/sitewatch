import {
  msToTimeStr,
  toSentenceCase,
  getNextRunDate,
  isHappeningNow,
  getTimeAgo,
  getTimeZone,
  formatDateWithTimezone,
  formatTimeWithTimezone,
  convertDelayToCron,
  getNextRunTimeWithCron,
} from "./utils";

describe("utils functions", () => {
  describe("msToTimeStr", () => {
    it("should convert milliseconds to a time string", () => {
      const result = msToTimeStr(1234567890);
      expect(result).toBe("2 weeks 0 days 6 hours 56 minutes");
    });
  });

  describe("toSentenceCase", () => {
    it("should convert string to sentence case", () => {
      const result = toSentenceCase("hello WORLD");
      expect(result).toBe("Hello world");
    });

    it("should handle empty string", () => {
      const result = toSentenceCase("");
      expect(result).toBe("");
    });
  });

  describe("getNextRunDate", () => {
    it("should calculate the next run date correctly", () => {
      const now = new Date();
      const delayMs = 4 * 60 * 60 * 1000; // 4 hours
      const startHour = "3";
      const nextRunDate = getNextRunDate(startHour, delayMs);

      // Check if the next run date is greater than now
      expect(nextRunDate > now).toBe(true);

      // Check if the next run date is set to the correct hour
      expect(nextRunDate.getUTCHours()).toBe(3);
    });
  });

  describe("getNextRunTimeWithCron", () => {
    const testCases = [
      {
        cronString: "*/5 * * * *", // Runs every 5 minutes
        currentDate: "2023-07-19T17:01:00Z",
        expectedRunTime: "2023-07-19T17:05:00Z",
      },
      {
        cronString: "*/30 * * * *", // Runs every 30 minutes
        currentDate: "2023-07-19T17:01:00Z",
        expectedRunTime: "2023-07-19T17:30:00Z",
      },
      {
        cronString: "0 */4 * * *", // Runs every 4 hours
        currentDate: "2023-07-19T10:00:00Z",
        expectedRunTime: "2023-07-19T12:00:00Z",
      },
      {
        cronString: "0 1-23/4 * * *", // Runs every 4 hours starting at 1 AM UTC
        currentDate: "2023-07-19T10:00:00Z",
        expectedRunTime: "2023-07-19T13:00:00Z",
      },
      {
        cronString: "0 */4 * * *", // Runs every 4 hours with differnt start time
        currentDate: "2023-07-19T03:00:00Z",
        expectedRunTime: "2023-07-19T04:00:00Z",
      },
      {
        cronString: "0 */12 * * *", // Runs every 12 hours
        currentDate: "2023-07-19T08:00:00Z",
        expectedRunTime: "2023-07-19T12:00:00Z",
      },
      {
        cronString: "0 19 * * *", // Runs at 19:00 UTC daily
        currentDate: "2023-07-19T18:00:00Z",
        expectedRunTime: "2023-07-19T19:00:00Z",
      },
      {
        cronString: "0 19 * * 0", // Runs at 19:00 UTC every Sunday
        currentDate: "2023-07-16T19:00:00Z",
        expectedRunTime: "2023-07-23T19:00:00Z",
      },
      {
        cronString: "0 19 * * *", // Runs at 19:00 UTC daily
        currentDate: "2023-07-19T17:00:00Z",
        expectedRunTime: "2023-07-19T19:00:00Z",
      },
      {
        cronString: "*/15 * * * *", // Runs every 15 minutes
        currentDate: "2023-07-19T17:01:00Z",
        expectedRunTime: "2023-07-19T17:15:00Z",
      },
      {
        cronString: "0 0 * * *", // Runs at midnight UTC daily
        currentDate: "2023-07-19T23:59:00Z",
        expectedRunTime: "2023-07-20T00:00:00Z",
      },
      {
        cronString: "0 8 1 * *", // Runs at 08:00 UTC on the first day of every month
        currentDate: "2023-06-30T07:59:00Z",
        expectedRunTime: "2023-07-01T08:00:00Z",
      },
      {
        cronString: "0 8 1 * *", // Runs at 08:00 UTC on the first day of every month
        currentDate: "2023-07-01T08:01:00Z",
        expectedRunTime: "2023-08-01T08:00:00Z",
      },
      {
        cronString: "0 8 1 1 *", // Runs at 08:00 UTC on the first day of January every year
        currentDate: "2023-12-31T07:59:00Z",
        expectedRunTime: "2024-01-01T08:00:00Z",
      },
      {
        cronString: "0 8 1 1 *", // Runs at 08:00 UTC on the first day of January every year
        currentDate: "2024-01-01T08:01:00Z",
        expectedRunTime: "2025-01-01T08:00:00Z",
      },
      {
        cronString: "0 8 * * 1", // Runs at 08:00 UTC every Monday
        currentDate: "2023-07-18T08:00:00Z",
        expectedRunTime: "2023-07-24T08:00:00Z",
      },
      {
        cronString: "0 8 */3 * *", // Runs at 08:00 UTC every 3 days
        currentDate: "2023-07-01T08:00:00Z",
        expectedRunTime: "2023-07-04T08:00:00Z",
      },
      {
        cronString: "0 8 1 */2 *", // Runs at 08:00 UTC on the first day of every 2 months
        currentDate: "2023-07-01T08:00:00Z",
        expectedRunTime: "2023-09-01T08:00:00Z",
      },
      {
        cronString: "0 8 1 * 3", // Runs at 08:00 UTC on the first day of every month in March
        currentDate: "2023-02-28T08:00:00Z",
        expectedRunTime: "2023-03-01T08:00:00Z",
      },
      {
        cronString: "0 0 1 1 *", // Runs at midnight UTC on the first day of January every year
        currentDate: "2023-12-31T23:59:00Z",
        expectedRunTime: "2024-01-01T00:00:00Z",
      },
    ];

    beforeAll(() => {
      jest.useFakeTimers();
    });

    afterAll(() => {
      jest.useRealTimers();
    });

    test.each(testCases)(
      "should return the correct next run time for cron string $cronString",
      ({ cronString, currentDate, expectedRunTime }) => {
        jest.setSystemTime(new Date(currentDate));

        const nextRunTime = getNextRunTimeWithCron(cronString);
        expect(nextRunTime.toISOString()).toBe(
          new Date(expectedRunTime).toISOString()
        );

        jest.spyOn(global, "Date").mockRestore();
      }
    );

    it("should handle invalid cron strings gracefully", () => {
      const cronString = "invalid cron string";
      expect(() => getNextRunTimeWithCron(cronString)).toThrow();
    });
  });
  describe("isHappeningNow", () => {
    it("should correctly determine if an execution should be happening now", () => {
      const lastExecutedAt = new Date().toISOString();
      const startHour = "3";
      const delayMs = 4 * 60 * 60 * 1000; // 4 hours

      const result = isHappeningNow(lastExecutedAt, startHour, delayMs);
      expect(result).toBe(false);
    });
  });

  describe("getTimeAgo", () => {
    it("should return a formatted time ago string", () => {
      const pastDate = new Date(Date.now() - 5 * 60 * 1000); // 5 minutes ago
      const result = getTimeAgo(pastDate);
      expect(result).toBe("5 minutes ago");
    });
  });

  describe("getTimeZone", () => {
    it("should return the current time zone", () => {
      const timeZone = getTimeZone();
      expect(timeZone).toBe(Intl.DateTimeFormat().resolvedOptions().timeZone);
    });
  });

  describe("formatDateWithTimezone", () => {
    it("should format date with time zone", () => {
      const date = new Date();
      const formattedDate = formatDateWithTimezone(date.toISOString());
      expect(formattedDate).toBe(
        new Intl.DateTimeFormat("en-US", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          timeZoneName: "short",
        }).format(date)
      );
    });
  });

  describe("formatTimeWithTimezone", () => {
    it("should format time with time zone", () => {
      const hour = 15; // 3 PM
      const formattedTime = formatTimeWithTimezone(hour);
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

      expect(formattedTime).toBe(
        utcDate.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "numeric",
          hour12: true,
          timeZone: getTimeZone(),
          timeZoneName: "short",
        })
      );
    });
  });

  describe("convertDelayToCron", () => {
    it("should convert '5 minutes' to cron expression", () => {
      const result = convertDelayToCron("5 minutes");
      expect(result).toBe("*/5 * * * *");
    });

    it("should convert '30 minutes' to cron expression", () => {
      const result = convertDelayToCron("30 minutes");
      expect(result).toBe("*/30 * * * *");
    });

    it("should convert '4 hours' to cron expression with hour offset", () => {
      const result = convertDelayToCron("4 hours", 3);
      expect(result).toBe("0 */4 * * *");
    });

    it("should convert '1 day' to cron expression with hour offset", () => {
      const result = convertDelayToCron("1 day", 19);
      expect(result).toBe("0 19 */1 * *");
    });

    it("should convert '1 week' to cron expression with hour offset", () => {
      const result = convertDelayToCron("1 week", 19);
      expect(result).toBe("0 19 * * 1");
    });

    it("should throw error for unsupported delay format", () => {
      expect(() => convertDelayToCron("1 month")).toThrow(
        "Invalid delay format"
      );
    });

    it("should throw error for missing hour offset for delays over 1 hour", () => {
      expect(() => convertDelayToCron("4 hours")).toThrow(
        "Hour offset must be specified for delays over 1 hour"
      );
    });
  });
});
