const delayToCronMap = [
  { delay: 5 * 60 * 1000, cron: "*/5 * * * *" },
  { delay: 10 * 60 * 1000, cron: "*/10 * * * *" },
  { delay: 30 * 60 * 1000, cron: "*/30 * * * *" },
  { delay: 60 * 60 * 1000, cron: "0 * * * *" },
  { delay: 4 * 60 * 60 * 1000, cron: "0 */4 * * *" },
  { delay: 4 * 60 * 60 * 1000, cron: "0 1-23/4 * * *" },
  { delay: 4 * 60 * 60 * 1000, cron: "0 3-23/4 * * *" },
  { delay: 12 * 60 * 60 * 1000, cron: "0 */12 * * *" },
  { delay: 12 * 60 * 60 * 1000, cron: "0 7/12 * * *" },
  { delay: 24 * 60 * 60 * 1000, cron: "0 0 * * *" },
  { delay: 24 * 60 * 60 * 1000, cron: "0 2 * * *" },
  { delay: 24 * 60 * 60 * 1000, cron: "0 9 * * *" },
  { delay: 24 * 60 * 60 * 1000, cron: "0 19 * * *" },
  { delay: 3 * 24 * 60 * 60 * 1000, cron: "0 3 */3 * *" },
  { delay: 7 * 24 * 60 * 60 * 1000, cron: "0 8 * * 1" },
  { delay: 7 * 24 * 60 * 60 * 1000, cron: "0 0 * * 0" },
  { delay: 7 * 24 * 60 * 60 * 1000, cron: "0 17 * * 3" },
];

export const generateDummyData = (
  rows: number,
  format: "dynamoDB" | "plain"
) => {
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
      keyword: "Keyword",
      opposite: false,
    },
    "EBAY PRICE THRESHOLD": {
      threshold: 100.95,
    },
    "PAGE DIFFERENCE": {
      percent_diff: 0.05,
    },
  };

  const getRandomDate = (status) => {
    const now = new Date();
    if (status === "ACTIVE") {
      return now.toISOString();
    }
    const rand = Math.random();
    if (rand < 0.25) {
      return new Date(
        now.getTime() - Math.random() * 4 * 60 * 60 * 1000
      ).toISOString();
    } else if (rand < 0.5) {
      return new Date(
        now.getTime() - Math.random() * 2 * 30 * 24 * 60 * 60 * 1000
      ).toISOString();
    } else if (rand < 0.75) {
      return new Date(
        now.getTime() - Math.random() * 365 * 24 * 60 * 60 * 1000
      ).toISOString();
    } else {
      return new Date(
        now.getTime() - Math.random() * 5 * 365 * 24 * 60 * 60 * 1000
      ).toISOString();
    }
  };

  for (let i = 0; i < rows; i++) {
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
    const previousAlerts = Array.from(
      { length: Math.floor(Math.random() * 5) },
      () => getRandomDate("")
    );
    const mostRecentAlert = previousAlerts[previousAlerts.length - 1];
    const cron = delayToCronMap[delayIndex].cron;

    if (format === "dynamoDB") {
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
        delayMs: { N: delayMs.toString() },
        attributes: { M: attributes },
        email: { S: email },
        mostRecentAlert: { S: mostRecentAlert },
        cron: { S: cron },
      });
    } else {
      data.push({
        alias: `Alias ${i}`,
        check_type: checkType,
        pk: pk,
        sk: sk,
        type: "CHECK",
        url: url,
        userid: userId,
        createdAt: createdAt,
        updatedAt: updatedAt,
        lastResult: {
          status: lastResult,
          message: "Message",
          timestamp: lastExecutedAt,
        },
        status: status,
        delayMs: delayMs,
        attributes: attributes,
        email: email,
        mostRecentAlert: mostRecentAlert,
        cron: cron,
      });
    }
  }

  return data;
};
