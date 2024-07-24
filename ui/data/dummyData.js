export const dummyData = [
  {
    alias: {
      S: "Alias 0",
    },
    check_type: {
      S: "EBAY PRICE THRESHOLD",
    },
    pk: {
      S: "CHECK#zss762wq21d",
    },
    sk: {
      S: "CHECK",
    },
    type: {
      S: "CHECK",
    },
    url: {
      S: "https://example0.com",
    },
    userid: {
      S: "118298783964592448941",
    },
    createdAt: {
      S: "2024-07-23T01:48:52.047Z",
    },
    updatedAt: {
      S: "2024-07-23T01:48:52.047Z",
    },
    lastResult: {
      M: {
        status: {
          S: "FAILED",
        },
        message: {
          S: "Message",
        },
        timestamp: {
          S: "2024-07-22T23:59:11.238Z",
        },
      },
    },
    status: {
      S: "PAUSED",
    },
    delayMs: {
      N: "14400000",
    },
    attributes: {
      M: {
        threshold: {
          N: "100.95",
        },
      },
    },
    email: {
      S: "exampleemail0@gmail.com",
    },
    mostRecentAlert: {
      S: "2019-10-21T05:39:53.993Z",
    },
    startHour: {
      N: "0",
    },
    cron: {
      S: "0 */4 * * *",
    },
  },
  {
    alias: {
      S: "Alias 1",
    },
    check_type: {
      S: "EBAY PRICE THRESHOLD",
    },
    pk: {
      S: "CHECK#frlr2w1wly",
    },
    sk: {
      S: "CHECK",
    },
    type: {
      S: "CHECK",
    },
    url: {
      S: "https://example1.com",
    },
    userid: {
      S: "118298783964592448941",
    },
    createdAt: {
      S: "2024-07-23T01:48:52.047Z",
    },
    updatedAt: {
      S: "2024-07-23T01:48:52.047Z",
    },
    lastResult: {
      M: {
        status: {
          S: "ALERTED",
        },
        message: {
          S: "Message",
        },
        timestamp: {
          S: "2024-07-23T01:48:52.047Z",
        },
      },
    },
    status: {
      S: "ACTIVE",
    },
    delayMs: {
      N: "86400000",
    },
    attributes: {
      M: {
        threshold: {
          N: "100.95",
        },
      },
    },
    email: {
      S: "exampleemail1@gmail.com",
    },
    mostRecentAlert: {
      S: "2024-07-02T17:47:54.986Z",
    },
    startHour: {
      N: "5",
    },
    cron: {
      S: "0 0 * * *",
    },
  },
  {
    alias: {
      S: "Alias 2",
    },
    check_type: {
      S: "KEYWORD CHECK",
    },
    pk: {
      S: "CHECK#2x8d0xmcgmo",
    },
    sk: {
      S: "CHECK",
    },
    type: {
      S: "CHECK",
    },
    url: {
      S: "https://example2.com",
    },
    userid: {
      S: "118298783964592448941",
    },
    createdAt: {
      S: "2024-07-23T01:48:52.047Z",
    },
    updatedAt: {
      S: "2024-07-23T01:48:52.047Z",
    },
    lastResult: {
      M: {
        status: {
          S: "ALERTED",
        },
        message: {
          S: "Message",
        },
        timestamp: {
          S: "2024-05-30T04:28:21.464Z",
        },
      },
    },
    status: {
      S: "PAUSED",
    },
    delayMs: {
      N: "3600000",
    },
    attributes: {
      M: {
        keyword: {
          S: "Keyword",
        },
        opposite: {
          B: "false",
        },
      },
    },
    email: {
      S: "exampleemail2@gmail.com",
    },
    mostRecentAlert: {},
    startHour: {
      N: "0",
    },
    cron: {
      S: "0 * * * *",
    },
  },
  {
    alias: {
      S: "Alias 3",
    },
    check_type: {
      S: "PAGE DIFFERENCE",
    },
    pk: {
      S: "CHECK#svwiundama",
    },
    sk: {
      S: "CHECK",
    },
    type: {
      S: "CHECK",
    },
    url: {
      S: "https://example3.com",
    },
    userid: {
      S: "118298783964592448941",
    },
    createdAt: {
      S: "2024-07-23T01:48:52.047Z",
    },
    updatedAt: {
      S: "2024-07-23T01:48:52.047Z",
    },
    lastResult: {
      M: {
        status: {
          S: "FAILED",
        },
        message: {
          S: "Message",
        },
        timestamp: {
          S: "2024-07-23T01:48:52.047Z",
        },
      },
    },
    status: {
      S: "ACTIVE",
    },
    delayMs: {
      N: "86400000",
    },
    attributes: {
      M: {
        percent_diff: {
          N: "0.05",
        },
      },
    },
    email: {
      S: "exampleemail3@gmail.com",
    },
    mostRecentAlert: {
      S: "2024-05-27T04:17:35.192Z",
    },
    startHour: {
      N: "20",
    },
    cron: {
      S: "0 9 * * *",
    },
  },
  {
    alias: {
      S: "Alias 4",
    },
    check_type: {
      S: "EBAY PRICE THRESHOLD",
    },
    pk: {
      S: "CHECK#pstzu0ovn5m",
    },
    sk: {
      S: "CHECK",
    },
    type: {
      S: "CHECK",
    },
    url: {
      S: "https://example4.com",
    },
    userid: {
      S: "118298783964592448941",
    },
    createdAt: {
      S: "2024-07-23T01:48:52.047Z",
    },
    updatedAt: {
      S: "2024-07-23T01:48:52.047Z",
    },
    lastResult: {
      M: {
        status: {
          S: "ALERTED",
        },
        message: {
          S: "Message",
        },
        timestamp: {
          S: "2024-07-23T01:48:52.047Z",
        },
      },
    },
    status: {
      S: "ACTIVE",
    },
    delayMs: {
      N: "259200000",
    },
    attributes: {
      M: {
        threshold: {
          N: "100.95",
        },
      },
    },
    email: {
      S: "exampleemail4@gmail.com",
    },
    mostRecentAlert: {},
    startHour: {
      N: "33",
    },
    cron: {
      S: "0 3 */3 * *",
    },
  },
  {
    alias: {
      S: "Alias 5",
    },
    check_type: {
      S: "PAGE DIFFERENCE",
    },
    pk: {
      S: "CHECK#7p46ukv4hfw",
    },
    sk: {
      S: "CHECK",
    },
    type: {
      S: "CHECK",
    },
    url: {
      S: "https://example5.com",
    },
    userid: {
      S: "118298783964592448941",
    },
    createdAt: {
      S: "2024-07-23T01:48:52.047Z",
    },
    updatedAt: {
      S: "2024-07-23T01:48:52.047Z",
    },
    lastResult: {
      M: {
        status: {
          S: "FAILED",
        },
        message: {
          S: "Message",
        },
        timestamp: {
          S: "2023-04-23T02:11:25.248Z",
        },
      },
    },
    status: {
      S: "PAUSED",
    },
    delayMs: {
      N: "86400000",
    },
    attributes: {
      M: {
        percent_diff: {
          N: "0.05",
        },
      },
    },
    email: {
      S: "exampleemail5@gmail.com",
    },
    mostRecentAlert: {
      S: "2019-10-06T06:30:00.401Z",
    },
    startHour: {
      N: "14",
    },
    cron: {
      S: "0 9 * * *",
    },
  },
  {
    alias: {
      S: "Alias 6",
    },
    check_type: {
      S: "KEYWORD CHECK",
    },
    pk: {
      S: "CHECK#wdy00d44s5d",
    },
    sk: {
      S: "CHECK",
    },
    type: {
      S: "CHECK",
    },
    url: {
      S: "https://example6.com",
    },
    userid: {
      S: "118298783964592448941",
    },
    createdAt: {
      S: "2024-07-23T01:48:52.047Z",
    },
    updatedAt: {
      S: "2024-07-23T01:48:52.047Z",
    },
    lastResult: {
      M: {
        status: {
          S: "FAILED",
        },
        message: {
          S: "Message",
        },
        timestamp: {
          S: "2024-06-20T03:16:46.623Z",
        },
      },
    },
    status: {
      S: "PAUSED",
    },
    delayMs: {
      N: "604800000",
    },
    attributes: {
      M: {
        keyword: {
          S: "Keyword",
        },
        opposite: {
          B: "false",
        },
      },
    },
    email: {
      S: "exampleemail6@gmail.com",
    },
    mostRecentAlert: {},
    startHour: {
      N: "121",
    },
    cron: {
      S: "0 0 * * 0",
    },
  },
  {
    alias: {
      S: "Alias 7",
    },
    check_type: {
      S: "PAGE DIFFERENCE",
    },
    pk: {
      S: "CHECK#10gyjg7rk3z",
    },
    sk: {
      S: "CHECK",
    },
    type: {
      S: "CHECK",
    },
    url: {
      S: "https://example7.com",
    },
    userid: {
      S: "118298783964592448941",
    },
    createdAt: {
      S: "2024-07-23T01:48:52.047Z",
    },
    updatedAt: {
      S: "2024-07-23T01:48:52.047Z",
    },
    lastResult: {
      M: {
        status: {
          S: "NO ALERT",
        },
        message: {
          S: "Message",
        },
        timestamp: {
          S: "2023-08-15T01:08:14.782Z",
        },
      },
    },
    status: {
      S: "PAUSED",
    },
    delayMs: {
      N: "86400000",
    },
    attributes: {
      M: {
        percent_diff: {
          N: "0.05",
        },
      },
    },
    email: {
      S: "exampleemail7@gmail.com",
    },
    mostRecentAlert: {
      S: "2024-05-08T14:23:05.709Z",
    },
    startHour: {
      N: "8",
    },
    cron: {
      S: "0 2 * * *",
    },
  },
  {
    alias: {
      S: "Alias 8",
    },
    check_type: {
      S: "KEYWORD CHECK",
    },
    pk: {
      S: "CHECK#mab6r0m3hlj",
    },
    sk: {
      S: "CHECK",
    },
    type: {
      S: "CHECK",
    },
    url: {
      S: "https://example8.com",
    },
    userid: {
      S: "118298783964592448941",
    },
    createdAt: {
      S: "2024-07-23T01:48:52.047Z",
    },
    updatedAt: {
      S: "2024-07-23T01:48:52.047Z",
    },
    lastResult: {
      M: {
        status: {
          S: "FAILED",
        },
        message: {
          S: "Message",
        },
        timestamp: {
          S: "2021-06-13T08:04:57.301Z",
        },
      },
    },
    status: {
      S: "PAUSED",
    },
    delayMs: {
      N: "3600000",
    },
    attributes: {
      M: {
        keyword: {
          S: "Keyword",
        },
        opposite: {
          B: "false",
        },
      },
    },
    email: {
      S: "exampleemail8@gmail.com",
    },
    mostRecentAlert: {
      S: "2022-04-17T00:33:06.387Z",
    },
    startHour: {
      N: "0",
    },
    cron: {
      S: "0 * * * *",
    },
  },
  {
    alias: {
      S: "Alias 9",
    },
    check_type: {
      S: "KEYWORD CHECK",
    },
    pk: {
      S: "CHECK#np8m4bj9kds",
    },
    sk: {
      S: "CHECK",
    },
    type: {
      S: "CHECK",
    },
    url: {
      S: "https://example9.com",
    },
    userid: {
      S: "118298783964592448941",
    },
    createdAt: {
      S: "2024-07-23T01:48:52.047Z",
    },
    updatedAt: {
      S: "2024-07-23T01:48:52.047Z",
    },
    lastResult: {
      M: {
        status: {
          S: "ALERTED",
        },
        message: {
          S: "Message",
        },
        timestamp: {
          S: "2024-06-26T07:28:35.325Z",
        },
      },
    },
    status: {
      S: "PAUSED",
    },
    delayMs: {
      N: "604800000",
    },
    attributes: {
      M: {
        keyword: {
          S: "Keyword",
        },
        opposite: {
          B: "false",
        },
      },
    },
    email: {
      S: "exampleemail9@gmail.com",
    },
    mostRecentAlert: {
      S: "2024-07-23T00:07:29.438Z",
    },
    startHour: {
      N: "96",
    },
    cron: {
      S: "0 8 * * 1",
    },
  },
  {
    alias: {
      S: "Alias 10",
    },
    check_type: {
      S: "PAGE DIFFERENCE",
    },
    pk: {
      S: "CHECK#l74mbob4wig",
    },
    sk: {
      S: "CHECK",
    },
    type: {
      S: "CHECK",
    },
    url: {
      S: "https://example10.com",
    },
    userid: {
      S: "118298783964592448941",
    },
    createdAt: {
      S: "2024-07-23T01:48:52.047Z",
    },
    updatedAt: {
      S: "2024-07-23T01:48:52.047Z",
    },
    lastResult: {
      M: {
        status: {
          S: "NO ALERT",
        },
        message: {
          S: "Message",
        },
        timestamp: {
          S: "2024-07-23T01:48:52.047Z",
        },
      },
    },
    status: {
      S: "ACTIVE",
    },
    delayMs: {
      N: "3600000",
    },
    attributes: {
      M: {
        percent_diff: {
          N: "0.05",
        },
      },
    },
    email: {
      S: "exampleemail10@gmail.com",
    },
    mostRecentAlert: {
      S: "2024-01-18T22:51:41.483Z",
    },
    startHour: {
      N: "0",
    },
    cron: {
      S: "0 * * * *",
    },
  },
  {
    alias: {
      S: "Alias 11",
    },
    check_type: {
      S: "KEYWORD CHECK",
    },
    pk: {
      S: "CHECK#5usach68b9e",
    },
    sk: {
      S: "CHECK",
    },
    type: {
      S: "CHECK",
    },
    url: {
      S: "https://example11.com",
    },
    userid: {
      S: "118298783964592448941",
    },
    createdAt: {
      S: "2024-07-23T01:48:52.047Z",
    },
    updatedAt: {
      S: "2024-07-23T01:48:52.047Z",
    },
    lastResult: {
      M: {
        status: {
          S: "NO ALERT",
        },
        message: {
          S: "Message",
        },
        timestamp: {
          S: "2024-07-05T22:50:31.467Z",
        },
      },
    },
    status: {
      S: "PAUSED",
    },
    delayMs: {
      N: "43200000",
    },
    attributes: {
      M: {
        keyword: {
          S: "Keyword",
        },
        opposite: {
          B: "false",
        },
      },
    },
    email: {
      S: "exampleemail11@gmail.com",
    },
    mostRecentAlert: {},
    startHour: {
      N: "0",
    },
    cron: {
      S: "0 7/12 * * *",
    },
  },
  {
    alias: {
      S: "Alias 12",
    },
    check_type: {
      S: "KEYWORD CHECK",
    },
    pk: {
      S: "CHECK#ahw8zczx51f",
    },
    sk: {
      S: "CHECK",
    },
    type: {
      S: "CHECK",
    },
    url: {
      S: "https://example12.com",
    },
    userid: {
      S: "118298783964592448941",
    },
    createdAt: {
      S: "2024-07-23T01:48:52.047Z",
    },
    updatedAt: {
      S: "2024-07-23T01:48:52.047Z",
    },
    lastResult: {
      M: {
        status: {
          S: "ALERTED",
        },
        message: {
          S: "Message",
        },
        timestamp: {
          S: "2024-07-23T01:48:52.047Z",
        },
      },
    },
    status: {
      S: "ACTIVE",
    },
    delayMs: {
      N: "14400000",
    },
    attributes: {
      M: {
        keyword: {
          S: "Keyword",
        },
        opposite: {
          B: "false",
        },
      },
    },
    email: {
      S: "exampleemail12@gmail.com",
    },
    mostRecentAlert: {},
    startHour: {
      N: "1",
    },
    cron: {
      S: "0 1-23/4 * * *",
    },
  },
  {
    alias: {
      S: "Alias 13",
    },
    check_type: {
      S: "EBAY PRICE THRESHOLD",
    },
    pk: {
      S: "CHECK#hvatqu3h98m",
    },
    sk: {
      S: "CHECK",
    },
    type: {
      S: "CHECK",
    },
    url: {
      S: "https://example13.com",
    },
    userid: {
      S: "118298783964592448941",
    },
    createdAt: {
      S: "2024-07-23T01:48:52.047Z",
    },
    updatedAt: {
      S: "2024-07-23T01:48:52.047Z",
    },
    lastResult: {
      M: {
        status: {
          S: "ALERTED",
        },
        message: {
          S: "Message",
        },
        timestamp: {
          S: "2024-06-16T08:43:13.699Z",
        },
      },
    },
    status: {
      S: "PAUSED",
    },
    delayMs: {
      N: "1800000",
    },
    attributes: {
      M: {
        threshold: {
          N: "100.95",
        },
      },
    },
    email: {
      S: "exampleemail13@gmail.com",
    },
    mostRecentAlert: {
      S: "2024-06-17T19:48:34.432Z",
    },
    startHour: {
      N: "0",
    },
    cron: {
      S: "*/30 * * * *",
    },
  },
  {
    alias: {
      S: "Alias 14",
    },
    check_type: {
      S: "EBAY PRICE THRESHOLD",
    },
    pk: {
      S: "CHECK#df3bw63h9cl",
    },
    sk: {
      S: "CHECK",
    },
    type: {
      S: "CHECK",
    },
    url: {
      S: "https://example14.com",
    },
    userid: {
      S: "118298783964592448941",
    },
    createdAt: {
      S: "2024-07-23T01:48:52.047Z",
    },
    updatedAt: {
      S: "2024-07-23T01:48:52.047Z",
    },
    lastResult: {
      M: {
        status: {
          S: "FAILED",
        },
        message: {
          S: "Message",
        },
        timestamp: {
          S: "2024-07-03T05:41:47.756Z",
        },
      },
    },
    status: {
      S: "PAUSED",
    },
    delayMs: {
      N: "86400000",
    },
    attributes: {
      M: {
        threshold: {
          N: "100.95",
        },
      },
    },
    email: {
      S: "exampleemail14@gmail.com",
    },
    mostRecentAlert: {
      S: "2023-07-28T06:31:42.043Z",
    },
    startHour: {
      N: "3",
    },
    cron: {
      S: "0 2 * * *",
    },
  },
  {
    alias: {
      S: "Alias 15",
    },
    check_type: {
      S: "EBAY PRICE THRESHOLD",
    },
    pk: {
      S: "CHECK#92h7zst8osn",
    },
    sk: {
      S: "CHECK",
    },
    type: {
      S: "CHECK",
    },
    url: {
      S: "https://example15.com",
    },
    userid: {
      S: "118298783964592448941",
    },
    createdAt: {
      S: "2024-07-23T01:48:52.047Z",
    },
    updatedAt: {
      S: "2024-07-23T01:48:52.047Z",
    },
    lastResult: {
      M: {
        status: {
          S: "FAILED",
        },
        message: {
          S: "Message",
        },
        timestamp: {
          S: "2024-07-23T01:48:52.047Z",
        },
      },
    },
    status: {
      S: "ACTIVE",
    },
    delayMs: {
      N: "86400000",
    },
    attributes: {
      M: {
        threshold: {
          N: "100.95",
        },
      },
    },
    email: {
      S: "exampleemail15@gmail.com",
    },
    mostRecentAlert: {},
    startHour: {
      N: "2",
    },
    cron: {
      S: "0 19 * * *",
    },
  },
  {
    alias: {
      S: "Alias 16",
    },
    check_type: {
      S: "KEYWORD CHECK",
    },
    pk: {
      S: "CHECK#u5fop5zz6vp",
    },
    sk: {
      S: "CHECK",
    },
    type: {
      S: "CHECK",
    },
    url: {
      S: "https://example16.com",
    },
    userid: {
      S: "118298783964592448941",
    },
    createdAt: {
      S: "2024-07-23T01:48:52.047Z",
    },
    updatedAt: {
      S: "2024-07-23T01:48:52.047Z",
    },
    lastResult: {
      M: {
        status: {
          S: "FAILED",
        },
        message: {
          S: "Message",
        },
        timestamp: {
          S: "2024-07-23T01:48:52.047Z",
        },
      },
    },
    status: {
      S: "ACTIVE",
    },
    delayMs: {
      N: "86400000",
    },
    attributes: {
      M: {
        keyword: {
          S: "Keyword",
        },
        opposite: {
          B: "false",
        },
      },
    },
    email: {
      S: "exampleemail16@gmail.com",
    },
    mostRecentAlert: {
      S: "2024-06-17T01:50:08.143Z",
    },
    startHour: {
      N: "23",
    },
    cron: {
      S: "0 2 * * *",
    },
  },
  {
    alias: {
      S: "Alias 17",
    },
    check_type: {
      S: "EBAY PRICE THRESHOLD",
    },
    pk: {
      S: "CHECK#mkvgi912cfc",
    },
    sk: {
      S: "CHECK",
    },
    type: {
      S: "CHECK",
    },
    url: {
      S: "https://example17.com",
    },
    userid: {
      S: "118298783964592448941",
    },
    createdAt: {
      S: "2024-07-23T01:48:52.047Z",
    },
    updatedAt: {
      S: "2024-07-23T01:48:52.047Z",
    },
    lastResult: {
      M: {
        status: {
          S: "NO ALERT",
        },
        message: {
          S: "Message",
        },
        timestamp: {
          S: "2024-07-23T01:48:52.047Z",
        },
      },
    },
    status: {
      S: "ACTIVE",
    },
    delayMs: {
      N: "604800000",
    },
    attributes: {
      M: {
        threshold: {
          N: "100.95",
        },
      },
    },
    email: {
      S: "exampleemail17@gmail.com",
    },
    mostRecentAlert: {
      S: "2023-10-07T12:21:56.321Z",
    },
    startHour: {
      N: "162",
    },
    cron: {
      S: "0 8 * * 1",
    },
  },
  {
    alias: {
      S: "Alias 18",
    },
    check_type: {
      S: "KEYWORD CHECK",
    },
    pk: {
      S: "CHECK#6814jwd9n1m",
    },
    sk: {
      S: "CHECK",
    },
    type: {
      S: "CHECK",
    },
    url: {
      S: "https://example18.com",
    },
    userid: {
      S: "118298783964592448941",
    },
    createdAt: {
      S: "2024-07-23T01:48:52.047Z",
    },
    updatedAt: {
      S: "2024-07-23T01:48:52.047Z",
    },
    lastResult: {
      M: {
        status: {
          S: "FAILED",
        },
        message: {
          S: "Message",
        },
        timestamp: {
          S: "2024-04-19T07:45:37.592Z",
        },
      },
    },
    status: {
      S: "PAUSED",
    },
    delayMs: {
      N: "86400000",
    },
    attributes: {
      M: {
        keyword: {
          S: "Keyword",
        },
        opposite: {
          B: "false",
        },
      },
    },
    email: {
      S: "exampleemail18@gmail.com",
    },
    mostRecentAlert: {
      S: "2024-07-18T13:36:17.773Z",
    },
    startHour: {
      N: "8",
    },
    cron: {
      S: "0 9 * * *",
    },
  },
  {
    alias: {
      S: "Alias 19",
    },
    check_type: {
      S: "PAGE DIFFERENCE",
    },
    pk: {
      S: "CHECK#o7qiovrz22o",
    },
    sk: {
      S: "CHECK",
    },
    type: {
      S: "CHECK",
    },
    url: {
      S: "https://example19.com",
    },
    userid: {
      S: "118298783964592448941",
    },
    createdAt: {
      S: "2024-07-23T01:48:52.047Z",
    },
    updatedAt: {
      S: "2024-07-23T01:48:52.047Z",
    },
    lastResult: {
      M: {
        status: {
          S: "ALERTED",
        },
        message: {
          S: "Message",
        },
        timestamp: {
          S: "2024-07-22T22:05:16.073Z",
        },
      },
    },
    status: {
      S: "PAUSED",
    },
    delayMs: {
      N: "259200000",
    },
    attributes: {
      M: {
        percent_diff: {
          N: "0.05",
        },
      },
    },
    email: {
      S: "exampleemail19@gmail.com",
    },
    mostRecentAlert: {
      S: "2021-09-25T15:43:08.556Z",
    },
    startHour: {
      N: "37",
    },
    cron: {
      S: "0 3 */3 * *",
    },
  },
  {
    alias: {
      S: "Alias 20",
    },
    check_type: {
      S: "KEYWORD CHECK",
    },
    pk: {
      S: "CHECK#5yx72wigarf",
    },
    sk: {
      S: "CHECK",
    },
    type: {
      S: "CHECK",
    },
    url: {
      S: "https://example20.com",
    },
    userid: {
      S: "118298783964592448941",
    },
    createdAt: {
      S: "2024-07-23T01:48:52.047Z",
    },
    updatedAt: {
      S: "2024-07-23T01:48:52.047Z",
    },
    lastResult: {
      M: {
        status: {
          S: "NO ALERT",
        },
        message: {
          S: "Message",
        },
        timestamp: {
          S: "2024-07-23T00:34:55.013Z",
        },
      },
    },
    status: {
      S: "PAUSED",
    },
    delayMs: {
      N: "3600000",
    },
    attributes: {
      M: {
        keyword: {
          S: "Keyword",
        },
        opposite: {
          B: "false",
        },
      },
    },
    email: {
      S: "exampleemail20@gmail.com",
    },
    mostRecentAlert: {
      S: "2024-06-15T21:28:18.704Z",
    },
    startHour: {
      N: "0",
    },
    cron: {
      S: "0 * * * *",
    },
  },
  {
    alias: {
      S: "Alias 21",
    },
    check_type: {
      S: "PAGE DIFFERENCE",
    },
    pk: {
      S: "CHECK#el2llyfjamo",
    },
    sk: {
      S: "CHECK",
    },
    type: {
      S: "CHECK",
    },
    url: {
      S: "https://example21.com",
    },
    userid: {
      S: "118298783964592448941",
    },
    createdAt: {
      S: "2024-07-23T01:48:52.047Z",
    },
    updatedAt: {
      S: "2024-07-23T01:48:52.047Z",
    },
    lastResult: {
      M: {
        status: {
          S: "ALERTED",
        },
        message: {
          S: "Message",
        },
        timestamp: {
          S: "2024-07-23T01:48:52.047Z",
        },
      },
    },
    status: {
      S: "ACTIVE",
    },
    delayMs: {
      N: "14400000",
    },
    attributes: {
      M: {
        percent_diff: {
          N: "0.05",
        },
      },
    },
    email: {
      S: "exampleemail21@gmail.com",
    },
    mostRecentAlert: {
      S: "2024-06-26T23:34:34.988Z",
    },
    startHour: {
      N: "3",
    },
    cron: {
      S: "0 3-23/4 * * *",
    },
  },
  {
    alias: {
      S: "Alias 22",
    },
    check_type: {
      S: "EBAY PRICE THRESHOLD",
    },
    pk: {
      S: "CHECK#q392xabu2i",
    },
    sk: {
      S: "CHECK",
    },
    type: {
      S: "CHECK",
    },
    url: {
      S: "https://example22.com",
    },
    userid: {
      S: "118298783964592448941",
    },
    createdAt: {
      S: "2024-07-23T01:48:52.047Z",
    },
    updatedAt: {
      S: "2024-07-23T01:48:52.047Z",
    },
    lastResult: {
      M: {
        status: {
          S: "NO ALERT",
        },
        message: {
          S: "Message",
        },
        timestamp: {
          S: "2024-07-23T01:48:52.047Z",
        },
      },
    },
    status: {
      S: "ACTIVE",
    },
    delayMs: {
      N: "86400000",
    },
    attributes: {
      M: {
        threshold: {
          N: "100.95",
        },
      },
    },
    email: {
      S: "exampleemail22@gmail.com",
    },
    mostRecentAlert: {
      S: "2022-01-27T09:08:24.913Z",
    },
    startHour: {
      N: "12",
    },
    cron: {
      S: "0 9 * * *",
    },
  },
  {
    alias: {
      S: "Alias 23",
    },
    check_type: {
      S: "PAGE DIFFERENCE",
    },
    pk: {
      S: "CHECK#l1ye44c4xrk",
    },
    sk: {
      S: "CHECK",
    },
    type: {
      S: "CHECK",
    },
    url: {
      S: "https://example23.com",
    },
    userid: {
      S: "118298783964592448941",
    },
    createdAt: {
      S: "2024-07-23T01:48:52.047Z",
    },
    updatedAt: {
      S: "2024-07-23T01:48:52.047Z",
    },
    lastResult: {
      M: {
        status: {
          S: "NO ALERT",
        },
        message: {
          S: "Message",
        },
        timestamp: {
          S: "2024-07-01T23:42:30.757Z",
        },
      },
    },
    status: {
      S: "PAUSED",
    },
    delayMs: {
      N: "604800000",
    },
    attributes: {
      M: {
        percent_diff: {
          N: "0.05",
        },
      },
    },
    email: {
      S: "exampleemail23@gmail.com",
    },
    mostRecentAlert: {
      S: "2023-10-14T07:34:53.313Z",
    },
    startHour: {
      N: "137",
    },
    cron: {
      S: "0 0 * * 0",
    },
  },
  {
    alias: {
      S: "Alias 24",
    },
    check_type: {
      S: "EBAY PRICE THRESHOLD",
    },
    pk: {
      S: "CHECK#5ms2p3wfx84",
    },
    sk: {
      S: "CHECK",
    },
    type: {
      S: "CHECK",
    },
    url: {
      S: "https://example24.com",
    },
    userid: {
      S: "118298783964592448941",
    },
    createdAt: {
      S: "2024-07-23T01:48:52.047Z",
    },
    updatedAt: {
      S: "2024-07-23T01:48:52.047Z",
    },
    lastResult: {
      M: {
        status: {
          S: "ALERTED",
        },
        message: {
          S: "Message",
        },
        timestamp: {
          S: "2024-07-16T00:12:32.925Z",
        },
      },
    },
    status: {
      S: "PAUSED",
    },
    delayMs: {
      N: "86400000",
    },
    attributes: {
      M: {
        threshold: {
          N: "100.95",
        },
      },
    },
    email: {
      S: "exampleemail24@gmail.com",
    },
    mostRecentAlert: {
      S: "2024-07-22T23:00:25.816Z",
    },
    startHour: {
      N: "2",
    },
    cron: {
      S: "0 0 * * *",
    },
  },
  {
    alias: {
      S: "Alias 25",
    },
    check_type: {
      S: "PAGE DIFFERENCE",
    },
    pk: {
      S: "CHECK#x5fbs0z3d5j",
    },
    sk: {
      S: "CHECK",
    },
    type: {
      S: "CHECK",
    },
    url: {
      S: "https://example25.com",
    },
    userid: {
      S: "118298783964592448941",
    },
    createdAt: {
      S: "2024-07-23T01:48:52.047Z",
    },
    updatedAt: {
      S: "2024-07-23T01:48:52.047Z",
    },
    lastResult: {
      M: {
        status: {
          S: "NO ALERT",
        },
        message: {
          S: "Message",
        },
        timestamp: {
          S: "2020-07-24T08:06:30.866Z",
        },
      },
    },
    status: {
      S: "PAUSED",
    },
    delayMs: {
      N: "14400000",
    },
    attributes: {
      M: {
        percent_diff: {
          N: "0.05",
        },
      },
    },
    email: {
      S: "exampleemail25@gmail.com",
    },
    mostRecentAlert: {
      S: "2024-07-22T23:36:05.436Z",
    },
    startHour: {
      N: "0",
    },
    cron: {
      S: "0 */4 * * *",
    },
  },
  {
    alias: {
      S: "Alias 26",
    },
    check_type: {
      S: "KEYWORD CHECK",
    },
    pk: {
      S: "CHECK#f1ht2tu49",
    },
    sk: {
      S: "CHECK",
    },
    type: {
      S: "CHECK",
    },
    url: {
      S: "https://example26.com",
    },
    userid: {
      S: "118298783964592448941",
    },
    createdAt: {
      S: "2024-07-23T01:48:52.047Z",
    },
    updatedAt: {
      S: "2024-07-23T01:48:52.047Z",
    },
    lastResult: {
      M: {
        status: {
          S: "FAILED",
        },
        message: {
          S: "Message",
        },
        timestamp: {
          S: "2024-07-23T01:48:52.047Z",
        },
      },
    },
    status: {
      S: "ACTIVE",
    },
    delayMs: {
      N: "86400000",
    },
    attributes: {
      M: {
        keyword: {
          S: "Keyword",
        },
        opposite: {
          B: "false",
        },
      },
    },
    email: {
      S: "exampleemail26@gmail.com",
    },
    mostRecentAlert: {},
    startHour: {
      N: "0",
    },
    cron: {
      S: "0 0 * * *",
    },
  },
  {
    alias: {
      S: "Alias 27",
    },
    check_type: {
      S: "PAGE DIFFERENCE",
    },
    pk: {
      S: "CHECK#88y45clxu9",
    },
    sk: {
      S: "CHECK",
    },
    type: {
      S: "CHECK",
    },
    url: {
      S: "https://example27.com",
    },
    userid: {
      S: "118298783964592448941",
    },
    createdAt: {
      S: "2024-07-23T01:48:52.047Z",
    },
    updatedAt: {
      S: "2024-07-23T01:48:52.047Z",
    },
    lastResult: {
      M: {
        status: {
          S: "ALERTED",
        },
        message: {
          S: "Message",
        },
        timestamp: {
          S: "2024-07-23T01:48:52.047Z",
        },
      },
    },
    status: {
      S: "ACTIVE",
    },
    delayMs: {
      N: "14400000",
    },
    attributes: {
      M: {
        percent_diff: {
          N: "0.05",
        },
      },
    },
    email: {
      S: "exampleemail27@gmail.com",
    },
    mostRecentAlert: {
      S: "2024-04-17T17:36:31.830Z",
    },
    startHour: {
      N: "0",
    },
    cron: {
      S: "0 1-23/4 * * *",
    },
  },
  {
    alias: {
      S: "Alias 28",
    },
    check_type: {
      S: "EBAY PRICE THRESHOLD",
    },
    pk: {
      S: "CHECK#qqh289txua",
    },
    sk: {
      S: "CHECK",
    },
    type: {
      S: "CHECK",
    },
    url: {
      S: "https://example28.com",
    },
    userid: {
      S: "118298783964592448941",
    },
    createdAt: {
      S: "2024-07-23T01:48:52.047Z",
    },
    updatedAt: {
      S: "2024-07-23T01:48:52.047Z",
    },
    lastResult: {
      M: {
        status: {
          S: "ALERTED",
        },
        message: {
          S: "Message",
        },
        timestamp: {
          S: "2024-04-20T10:39:40.676Z",
        },
      },
    },
    status: {
      S: "PAUSED",
    },
    delayMs: {
      N: "14400000",
    },
    attributes: {
      M: {
        threshold: {
          N: "100.95",
        },
      },
    },
    email: {
      S: "exampleemail28@gmail.com",
    },
    mostRecentAlert: {
      S: "2024-07-22T22:03:13.430Z",
    },
    startHour: {
      N: "3",
    },
    cron: {
      S: "0 1-23/4 * * *",
    },
  },
  {
    alias: {
      S: "Alias 29",
    },
    check_type: {
      S: "EBAY PRICE THRESHOLD",
    },
    pk: {
      S: "CHECK#abrne1wjfm",
    },
    sk: {
      S: "CHECK",
    },
    type: {
      S: "CHECK",
    },
    url: {
      S: "https://example29.com",
    },
    userid: {
      S: "118298783964592448941",
    },
    createdAt: {
      S: "2024-07-23T01:48:52.047Z",
    },
    updatedAt: {
      S: "2024-07-23T01:48:52.047Z",
    },
    lastResult: {
      M: {
        status: {
          S: "ALERTED",
        },
        message: {
          S: "Message",
        },
        timestamp: {
          S: "2024-04-14T13:27:36.160Z",
        },
      },
    },
    status: {
      S: "PAUSED",
    },
    delayMs: {
      N: "14400000",
    },
    attributes: {
      M: {
        threshold: {
          N: "100.95",
        },
      },
    },
    email: {
      S: "exampleemail29@gmail.com",
    },
    mostRecentAlert: {
      S: "2024-05-25T09:58:26.051Z",
    },
    startHour: {
      N: "0",
    },
    cron: {
      S: "0 3-23/4 * * *",
    },
  },
];
