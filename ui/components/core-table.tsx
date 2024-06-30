import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  format,
  formatDistanceToNow,
  formatDistanceToNowStrict,
} from "date-fns";
import { InfoCircledIcon } from "@radix-ui/react-icons";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ThreeDots } from "react-loader-spinner";

import { generateDummyData } from "@/data/generateDummyData";
console.log(JSON.stringify(generateDummyData(20)));

const check_type_descriptions = {
  "KEYWORD CHECK": "Check if a keyword exists in the page",
  "EBAY PRICE THRESHOLD":
    'Check if an eBay "Buy it Now" price is below a threshold',
  "PAGE DIFFERENCE": "Check if a page has changed",
};

const toSentenceCase = (str) => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

const loadingDots = (
  <ThreeDots
    visible={true}
    height="40"
    width="40"
    color="#fff"
    radius="9"
    ariaLabel="three-dots-loading"
    wrapperStyle={{}}
    wrapperClass=""
  />
);

const emptyDash = <Badge className="bg-gray-700 hover:bg-gray-700" />;

const CoreTable = ({ data }) => {
  const handleShowDetails = (item) => {
    alert(`Details:\n
        PK: ${item.pk?.S ?? emptyDash}\n
        SK: ${item.sk?.S ?? emptyDash}\n
        User ID: ${item.userid?.S ?? emptyDash}\n
        URL: ${item.url?.S ?? emptyDash}\n
        Check Type: ${item.check_type?.S ?? emptyDash}\n
        Delay (ms): ${item.delayMs?.S ?? emptyDash}\n
        Status: ${item.status?.S ?? emptyDash}\n
        Created At: ${item.createdAt?.S ?? emptyDash}\n
        Updated At: ${item.updatedAt?.S ?? emptyDash}\n
        Last Executed At: ${item.lastExecutedAt?.S ?? emptyDash}\n
        Last Result: ${
          item.lastResult ? JSON.stringify(item.lastResult.S) : emptyDash
        }`);
  };

  const formatDateWithTimezone = (date) => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      timeZoneName: "short",
    }).format(new Date(date));
  };

  const formatLastResult = (lastResult, lastExecutedAt, email) => {
    if (!lastResult) return emptyDash;

    const formattedDateWithTimezone = lastExecutedAt
      ? formatDateWithTimezone(lastExecutedAt)
      : emptyDash;
    const timeAgo = lastExecutedAt
      ? formatDistanceToNowStrict(new Date(lastExecutedAt), { addSuffix: true })
      : emptyDash;
    const alertStatus = lastResult;
    const badgeStyle =
      lastResult === "ALERTED"
        ? "bg-green-700 text-white hover:bg-green-700"
        : "bg-gray-700 text-white hover:bg-gray-700";

    return (
      <div className="flex flex-col items-start gap-1">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger className="cursor-auto select-text">
              <Badge className={badgeStyle}>
                {toSentenceCase(alertStatus)}
              </Badge>
            </TooltipTrigger>
            {email && lastResult === "ALERTED" && (
              <TooltipContent>Email sent to {email}</TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger className="cursor-auto select-text text-sm text-gray-500 text-start">
              {"Last ran " + timeAgo}
            </TooltipTrigger>
            <TooltipContent>{formattedDateWithTimezone}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    );
  };

  const getNextRunDate = (lastExecutedAt, delayMs) => {
    // Find way to calculate next run date even with no runs before
    // todo: add data: createdAt, baselineTime? this might be for example "every 6pm"
    // this would also give us first run time
    if (!lastExecutedAt || !delayMs) return false;

    const lastExecutedDate = new Date(lastExecutedAt);
    if (isNaN(lastExecutedDate.getTime())) return emptyDash;

    const nextRunDate = new Date(lastExecutedDate.getTime() + Number(delayMs));
    return format(nextRunDate, "yyyy-MM-dd HH:mm");
  };

  const formatFrequency = (milliseconds, lastExecutedAt, status) => {
    const units = [
      { label: "month", value: 30 * 24 * 60 * 60 * 1000 },
      { label: "week", value: 7 * 24 * 60 * 60 * 1000 },
      { label: "day", value: 24 * 60 * 60 * 1000 },
      { label: "hour", value: 60 * 60 * 1000 },
      { label: "minute", value: 60 * 1000 },
    ];

    let remainingTime = milliseconds;
    const result = [];

    units.forEach((unit) => {
      const unitValue = Math.floor(remainingTime / unit.value);
      if (unitValue > 0) {
        result.push(`${unitValue} ${unit.label}${unitValue > 1 ? "s" : ""}`);
        remainingTime %= unit.value;
      }
    });

    return result.join(", ");
  };

  const formatStatusCell = (status) => {
    const badgeStyle =
      status === "ACTIVE"
        ? "bg-green-700 text-white hover:bg-green-700"
        : "bg-yellow-700 text-white hover:bg-yellow-700";

    return (
      <Badge className={badgeStyle}>
        {toSentenceCase(status) ?? emptyDash}
      </Badge>
    );
  };

  const formatNextRunCell = (lastExecutedAt, delayMs, status) => {
    if (status !== "ACTIVE") return emptyDash;

    const nextRunDate = new Date(getNextRunDate(lastExecutedAt, delayMs));
    const formattedDateWithTimezone = nextRunDate
      ? formatDateWithTimezone(nextRunDate)
      : emptyDash;
    const isRunning = isHappeningNow(lastExecutedAt, delayMs);

    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger className="text-start cursor-auto select-text">
            {lastExecutedAt && delayMs && !isRunning
              ? "In " +
                formatDistanceToNow(
                  new Date(getNextRunDate(lastExecutedAt, delayMs))
                )
              : !isRunning
              ? emptyDash
              : loadingDots}
          </TooltipTrigger>
          {!isRunning && (
            <TooltipContent>{formattedDateWithTimezone}</TooltipContent>
          )}
        </Tooltip>
      </TooltipProvider>
    );
  };

  const formatPastAlertsCell = (previousAlerts) => {
    if (!previousAlerts || previousAlerts.length === 0) return emptyDash;

    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger className="text-start cursor-auto select-text">
            {previousAlerts.length +
              " past alert" +
              (previousAlerts.length > 1 ? "s" : "")}
          </TooltipTrigger>
          <TooltipContent>
            <ScrollArea className="h-24 p-1 pr-4">
              <div className="flex flex-col gap-1">
                {previousAlerts.map((alert, index) => (
                  <a
                    className="hover:text-gray-400 underline"
                    href="alert/uuid"
                  >
                    {formatDateWithTimezone(alert.S)}
                  </a>
                ))}
              </div>
            </ScrollArea>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  const isHappeningNow = (lastExecutedAt, delayMs) => {
    if (!lastExecutedAt || !delayMs) return false;

    const lastExecutedDate = new Date(lastExecutedAt);
    if (isNaN(lastExecutedDate.getTime())) return false;

    const nextRunDate = new Date(getNextRunDate(lastExecutedAt, delayMs));
    const now = new Date();
    if (now <= nextRunDate) {
      console.log(nextRunDate, now);
    }
    return now >= nextRunDate;
  };

  const formatMostRecentAlertCell = (mostRecentAlert) => {
    // if (!mostRecentAlert) return emptyDash;

    const formattedDateWithTimezone = mostRecentAlert
      ? formatDateWithTimezone(mostRecentAlert)
      : null;
    const timeAgo = mostRecentAlert
      ? formatDistanceToNowStrict(new Date(mostRecentAlert), {
          addSuffix: true,
        })
      : "No alerts";

    const badgeStyle = mostRecentAlert
      ? "bg-green-700 text-white hover:bg-green-700"
      : "bg-gray-700 text-white hover:bg-gray-700";

    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger className="text-start cursor-auto select-text">
            <Badge className={badgeStyle}>{timeAgo}</Badge>
          </TooltipTrigger>
          {formattedDateWithTimezone && (
            <TooltipContent>{formattedDateWithTimezone}</TooltipContent>
          )}
        </Tooltip>
      </TooltipProvider>
    );
  };

  return (
    <Table className="min-w-full divide-y divide-gray-200">
      <TableCaption>A list of your recent checks.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>
            <Checkbox />
          </TableHead>
          <TableHead>Check Type</TableHead>
          <TableHead>Alias</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Frequency</TableHead>
          <TableHead>Next Run</TableHead>
          <TableHead>Last Result</TableHead>
          {/* <TableHead>Past Alerts</TableHead> */}
          <TableHead>Most Recent Alert</TableHead>
          <TableHead></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((item, index) => (
          <TableRow
            key={item.pk?.S ?? item.sk?.S ?? index}
            className="hover:bg-neutral-800"
          >
            <TableCell>
              <Checkbox />
            </TableCell>
            <TableCell>
              <div className="flex gap-2 items-center">
                {item.check_type?.S ?? emptyDash}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <InfoCircledIcon />
                    </TooltipTrigger>
                    <TooltipContent>
                      {check_type_descriptions[item.check_type?.S] ?? emptyDash}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </TableCell>

            <TableCell>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger className="cursor-auto select-text">
                    {item.alias?.S ?? emptyDash}
                  </TooltipTrigger>
                  <TooltipContent>
                    {
                      <a
                        className="hover:text-gray-400 underline text-ellipsis"
                        href={item.url?.S}
                      >
                        {item.url?.S ?? emptyDash}
                      </a>
                    }
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </TableCell>

            <TableCell>
              {formatStatusCell(
                item.status?.S,
                item.lastExecutedAt?.S,
                item.delayMs?.S
              )}
            </TableCell>
            <TableCell>
              {item.delayMs?.S
                ? formatFrequency(
                    Number(item.delayMs.S),
                    item.lastExecutedAt?.S,
                    item.status?.S
                  )
                : emptyDash}
            </TableCell>
            <TableCell>
              {formatNextRunCell(
                item.lastExecutedAt?.S,
                item.delayMs?.S,
                item.status?.S
              )}
            </TableCell>
            <TableCell>
              {formatLastResult(
                item.lastResult?.S,
                item.lastExecutedAt?.S,
                item.email?.S
              )}
            </TableCell>
            {/* <TableCell>
              {formatPastAlertsCell(item.previousAlerts?.L)}
            </TableCell> */}
            <TableCell>
              {formatMostRecentAlertCell(item.mostRecentAlert?.S)}
            </TableCell>
            <TableCell>
              <Button onClick={() => handleShowDetails(item)}>Details</Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default CoreTable;
