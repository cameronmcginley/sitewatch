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
import { format, formatDistanceToNow } from "date-fns";
import { InfoCircledIcon } from "@radix-ui/react-icons";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { generateDummyData } from "@/data/generateDummyData";
console.log(JSON.stringify(generateDummyData(20)));

const statusStyles = {
  ACTIVE: "text-green-500",
  PAUSED: "text-yellow-500",
  FAILED: "text-red-500",
};

const check_type_descriptions = {
  "KEYWORD CHECK": "Check if a keyword exists in the page",
  "EBAY PRICE THRESHOLD":
    'Check if an eBay "Buy it Now" price is below a threshold',
  "PAGE DIFFERENCE": "Check if a page has changed",
};

const CoreTable = ({ data }) => {
  const handleShowDetails = (item) => {
    alert(`Details:\n
        PK: ${item.pk?.S ?? "-"}\n
        SK: ${item.sk?.S ?? "-"}\n
        User ID: ${item.userid?.S ?? "-"}\n
        URL: ${item.url?.S ?? "-"}\n
        Check Type: ${item.check_type?.S ?? "-"}\n
        Delay (ms): ${item.delayMs?.S ?? "-"}\n
        Status: ${item.status?.S ?? "-"}\n
        Created At: ${item.createdAt?.S ?? "-"}\n
        Updated At: ${item.updatedAt?.S ?? "-"}\n
        Last Executed At: ${item.lastExecutedAt?.S ?? "-"}\n
        Last Result: ${
          item.lastResult ? JSON.stringify(item.lastResult.S) : "-"
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
    if (!lastResult) return "-";

    const formattedDateWithTimezone = lastExecutedAt
      ? formatDateWithTimezone(lastExecutedAt)
      : "-";
    const timeAgo = lastExecutedAt
      ? formatDistanceToNow(new Date(lastExecutedAt), { addSuffix: true })
      : "-";
    const alertStatus = lastResult;
    const badgeStyle =
      lastResult === "ALERTED"
        ? "bg-green-500 text-white hover:bg-green-500"
        : "bg-gray-500 text-white hover:bg-gray-500";

    return (
      <div className="flex flex-col justify-center gap-1 items-center">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger className="text-sm text-gray-500 cursor-default">
              {timeAgo}
            </TooltipTrigger>
            <TooltipContent>{formattedDateWithTimezone}</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger className="cursor-default">
              <Badge className={badgeStyle}>{alertStatus}</Badge>
            </TooltipTrigger>
            {email && lastResult === "ALERTED" && (
              <TooltipContent>Email sent to {email}</TooltipContent>
            )}
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
    if (isNaN(lastExecutedDate.getTime())) return "-";

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

  const formatStatusCell = (status, lastExecutedAt, delayMs) => {
    return (
      <div
        className={"cursor-default " + statusStyles[status] ?? "text-gray-500"}
      >
        {status ?? "-"}
      </div>
    );
  };

  const formatNextRunCell = (lastExecutedAt, delayMs, status) => {
    if (status !== "ACTIVE") return "-";

    const nextRunDate = new Date(getNextRunDate(lastExecutedAt, delayMs));
    const formattedDateWithTimezone = nextRunDate
      ? formatDateWithTimezone(nextRunDate)
      : "-";

    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger className="cursor-default">
            {lastExecutedAt && delayMs
              ? "In " +
                formatDistanceToNow(
                  new Date(getNextRunDate(lastExecutedAt, delayMs))
                )
              : "-"}
          </TooltipTrigger>
          <TooltipContent>{formattedDateWithTimezone}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  const formatPastAlertsCell = (previousAlerts) => {
    if (!previousAlerts || previousAlerts.length === 0) return "-";

    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger className="cursor-default">
            {previousAlerts.length +
              " past alert" +
              (previousAlerts.length > 1 ? "s" : "")}
          </TooltipTrigger>
          <TooltipContent className="flex flex-col gap-1">
            {previousAlerts.map((alert, index) => (
              <a href="alert/uuid">{formatDateWithTimezone(alert.S)}</a>
            ))}
          </TooltipContent>
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
          <TableHead>URL</TableHead>
          <TableHead>Frequency</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Last Result</TableHead>
          <TableHead>Next Run</TableHead>
          <TableHead>Past Alerts</TableHead>
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
                {item.check_type?.S ?? "-"}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <InfoCircledIcon />
                    </TooltipTrigger>
                    <TooltipContent>
                      {check_type_descriptions[item.check_type?.S] ?? "-"}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </TableCell>
            <TableCell>{item.url?.S ?? "-"}</TableCell>
            <TableCell>
              {item.delayMs?.S
                ? formatFrequency(
                    Number(item.delayMs.S),
                    item.lastExecutedAt?.S,
                    item.status?.S
                  )
                : "-"}
            </TableCell>
            <TableCell>
              {formatStatusCell(
                item.status?.S,
                item.lastExecutedAt?.S,
                item.delayMs?.S
              )}
            </TableCell>
            <TableCell>
              {formatLastResult(
                item.lastResult?.S,
                item.lastExecutedAt?.S,
                item.email?.S
              )}
            </TableCell>
            <TableCell>
              {formatNextRunCell(
                item.lastExecutedAt?.S,
                item.delayMs?.S,
                item.status?.S
              )}
            </TableCell>
            <TableCell>
              {formatPastAlertsCell(item.previousAlerts?.L)}
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
