// TODO: add dummy alert data
// new pk/sk. "Past alerts" link to this, page with alert specific details. Same details
// as email potentialls

// Maybe switch out to only store lastAlert. We could get too much data if storing a row for each alert

const getStartHour = (delayMs: number) => {
  // Generate random start hour
  // If 4 hours, then options are 0, 1, 2, 3
  // If 12 hours, then options are 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11
  // etc
  // Use UTC time, make string like T21:00:39.520Z
  const hours = Math.floor(delayMs / (60 * 60 * 1000));
  const startHour = Math.floor(Math.random() * hours);

  // Create the UTC time string
  const startTime = `T${startHour.toString().padStart(2, "0")}:00:00:000Z`;

  return startHour;
};

const delayToCronMap = [
  { delay: 5 * 60 * 1000, cron: "*/5 * * * *" }, // Every 5 minutes
  { delay: 10 * 60 * 1000, cron: "*/10 * * * *" }, // Every 10 minutes
  { delay: 30 * 60 * 1000, cron: "*/30 * * * *" }, // Every 30 minutes
  { delay: 60 * 60 * 1000, cron: "0 * * * *" }, // Every hour
  { delay: 4 * 60 * 60 * 1000, cron: "0 */4 * * *" }, // Every 4 hours starting at 00:00
  { delay: 4 * 60 * 60 * 1000, cron: "0 1-23/4 * * *" }, // Every 4 hours starting at 01:00
  { delay: 4 * 60 * 60 * 1000, cron: "0 3-23/4 * * *" }, // Every 4 hours starting at 03:00
  { delay: 12 * 60 * 60 * 1000, cron: "0 */12 * * *" }, // Every 12 hours starting at 00:00
  { delay: 12 * 60 * 60 * 1000, cron: "0 7/12 * * *" }, // Every 12 hours starting at 07:00
  { delay: 24 * 60 * 60 * 1000, cron: "0 0 * * *" }, // Every day at midnight
  { delay: 24 * 60 * 60 * 1000, cron: "0 2 * * *" }, // Every day at 02:00
  { delay: 24 * 60 * 60 * 1000, cron: "0 9 * * *" }, // Every day at 09:00
  { delay: 24 * 60 * 60 * 1000, cron: "0 19 * * *" }, // Daily at 19:00 UTC
  { delay: 3 * 24 * 60 * 60 * 1000, cron: "0 3 */3 * *" }, // Every 3 days at 03:00
  { delay: 7 * 24 * 60 * 60 * 1000, cron: "0 8 * * 1" }, // Every Monday at 08:00
  { delay: 7 * 24 * 60 * 60 * 1000, cron: "0 0 * * 0" }, // Every week (Sunday at 00:00)
  { delay: 7 * 24 * 60 * 60 * 1000, cron: "0 17 * * 3" }, // Every Wednesday at 17:00
];

export const generateDummyData = (rows: number) => {
  const data = [];
  const userId = "118298783964592448941";
  const checkTypes = [
    "KEYWORD CHECK",
    "EBAY PRICE THRESHOLD",
    "PAGE DIFFERENCE",
  ];
  const statuses = ["ACTIVE", "PAUSED"];
  const lastResults = ["ALERTED", "NO ALERT", "FAILED"];
  const attributes_options = {
    "KEYWORD CHECK": {
      keyword: { S: "Keyword" },
      opposite: { B: false },
    },
    "EBAY PRICE THRESHOLD": {
      threshold: { N: 100.95 },
    },
    "PAGE DIFFERENCE": {
      percent_diff: { N: 0.05 },
    },
  };

  const getRandomDate = (status) => {
    const now = new Date();

    if (status === "ACTIVE") {
      return now.toISOString();
    }

    const rand = Math.random();

    if (rand < 0.25) {
      // within 4 hours
      return new Date(
        now.getTime() - Math.random() * 4 * 60 * 60 * 1000
      ).toISOString();
    } else if (rand < 0.5) {
      // within 2 months
      return new Date(
        now.getTime() - Math.random() * 2 * 30 * 24 * 60 * 60 * 1000
      ).toISOString();
    } else if (rand < 0.75) {
      // within 1 year
      return new Date(
        now.getTime() - Math.random() * 365 * 24 * 60 * 60 * 1000
      ).toISOString();
    } else {
      // within 5 years
      return new Date(
        now.getTime() - Math.random() * 5 * 365 * 24 * 60 * 60 * 1000
      ).toISOString();
    }
  };

  for (let i = 0; i < rows; i++) {
    // Get random index from delayToCronMap
    const delayIndex = Math.floor(Math.random() * delayToCronMap.length);

    const pk = `CHECK#${Math.random().toString(36).substring(2, 15)}`;
    const sk = "CHECK";
    const url = `https://example${i}.com`;
    const checkType = checkTypes[Math.floor(Math.random() * checkTypes.length)];
    const delayMs = delayToCronMap[delayIndex].delay;
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const createdAt = new Date().toISOString();
    const updatedAt = new Date().toISOString();
    const lastExecutedAt = getRandomDate(status);
    const lastResult =
      lastResults[Math.floor(Math.random() * lastResults.length)];
    const attributes = attributes_options[checkType];
    const email = `exampleemail${i}@gmail.com`;
    // remove this if not storing alerts
    const previousAlerts = Array.from(
      { length: Math.floor(Math.random() * 5) },
      () => getRandomDate("")
    );
    const mostRecentAlert = previousAlerts[previousAlerts.length - 1];
    const cron = delayToCronMap[delayIndex].cron;

    data.push({
      alias: { S: `Alias ${i}` },
      check_type: { S: checkType },
      pk: { S: pk },
      sk: { S: sk },
      type: { S: "CHECK" },
      url: { S: url },
      userid: { S: userId },
      createdAt: { S: createdAt },
      updatedAt: { S: updatedAt },
      lastResult: {
        M: {
          status: { S: lastResult },
          message: { S: "Message" },
          timestamp: { S: lastExecutedAt },
        },
      },
      status: { S: status },
      delayMs: { N: delayMs },
      attributes: { M: attributes },
      email: { S: email },
      mostRecentAlert: { S: mostRecentAlert },
      startHour: { N: getStartHour(delayMs) },
      cron: { S: cron },
    });
  }

  return data;
};
