// TODO: add dummy alert data
// new pk/sk. "Past alerts" link to this, page with alert specific details. Same details
// as email potentialls

// Maybe switch out to only store lastAlert. We could get too much data if storing a row for each alert

export const generateDummyData = (rows: number) => {
    const data = [];
    const userId = "118298783964592448941";
    const checkTypes = ["KEYWORD CHECK", "EBAY PRICE THRESHOLD", "PAGE DIFFERENCE"];
    const statuses = ["ACTIVE", "PAUSED"];
    const lastResults = ["ALERTED", "NO ALERT"]
    const attributes_options = {
      "KEYWORD CHECK": {
        keyword: { S: "Keyword" },
        opposite: { S: "false" },
      },
      "EBAY PRICE THRESHOLD": {
        threshold: { N: 100.95 },
      },
      "PAGE DIFFERENCE": {
        percent_diff: { N: 0.05 },
      }
    }

    const getRandomDate = (status) => {
      const now = new Date();

      if (status === "ACTIVE") {
        return now.toISOString();
      }

      const rand = Math.random();

      if (rand < 0.25) {
        // within 4 hours
        return new Date(now.getTime() - Math.random() * 4 * 60 * 60 * 1000).toISOString();
      } else if (rand < 0.5) {
        // within 2 months
        return new Date(now.getTime() - Math.random() * 2 * 30 * 24 * 60 * 60 * 1000).toISOString();
      } else if (rand < 0.75) {
        // within 1 year
        return new Date(now.getTime() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString();
      } else {
        // within 5 years
        return new Date(now.getTime() - Math.random() * 5 * 365 * 24 * 60 * 60 * 1000).toISOString();
      }
    }

    const delayOptions = [
      5 * 60 * 1000,     // 5 minutes
      10 * 60 * 1000,    // 10 minutes
      30 * 60 * 1000,    // 30 minutes
      60 * 60 * 1000,    // 1 hour
      4 * 60 * 60 * 1000, // 4 hours
      12 * 60 * 60 * 1000, // 12 hours
      24 * 60 * 60 * 1000, // 1 day
      7 * 24 * 60 * 60 * 1000 // 1 week
    ];
    
    for (let i = 0; i < rows; i++) {
      const pk = `CHECK#${Math.random().toString(36).substring(2, 15)}`;
      const sk = "CHECK";
      const url = `https://example${i}.com`;
      const checkType = checkTypes[Math.floor(Math.random() * checkTypes.length)];
      const delayMs = delayOptions[Math.floor(Math.random() * delayOptions.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const createdAt = new Date().toISOString();
      const updatedAt = new Date().toISOString();
      const lastExecutedAt = getRandomDate(status);
      const lastResult = lastResults[Math.floor(Math.random() * lastResults.length)];
      const attributes = attributes_options[checkType];
      const email = `exampleemail${i}@gmail.com`
      // remove this if not storing alerts
      const previousAlerts = Array.from({length: Math.floor(Math.random() * 5)}, () => getRandomDate(""));
      const mostRecentAlert = previousAlerts[previousAlerts.length - 1];

      data.push({
        alias: { S: `Alias ${i}` },
        check_type: { S: checkType },
        keyword: { S: `Keyword ${i}` },
        opposite: { S: `${Math.random() > 0.5}` },
        pk: { S: pk },
        sk: { S: sk },
        type: { S: "CHECK" },
        url: { S: url },
        userid: { S: userId },
        createdAt: { S: createdAt },
        updatedAt: { S: updatedAt },
        lastExecutedAt: { S: lastExecutedAt },
        lastResult: { S: lastResult },
        status: { S: status },
        delayMs: { S: String(delayMs) },
        attributes: { M: attributes },
        email: { S: email },
        previousAlerts: { L: previousAlerts.map(alert => ({ S: alert })) },
        mostRecentAlert: { S: mostRecentAlert }
      });
    }
    
    return data;
  };
