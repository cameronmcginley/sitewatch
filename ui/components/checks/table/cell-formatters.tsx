import React from "react";
import { TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { InfoCircledIcon } from "@radix-ui/react-icons";
import {
  checkTypeDescriptions,
  emptyDash,
  loadingDots,
} from "@/components/checks/table/constants";
import {
  toSentenceCase,
  formatDateWithTimezone,
  getTimeAgo,
  msToTimeStr,
  getNextRunTimeFromCron,
  isHappeningNowFromCron,
  cronToPlainText,
} from "@/lib/checks/utils";
import { cn } from "@/lib/utils";
import { BADGE_COLOR_CLASS } from "@/lib/constants";
import { CheckItem, CheckType } from "@/lib/types";
import { StatusBadge } from "@/components/custom/StatusBadge";

export const formatCells = (item: CheckItem, columns) =>
  columns.map((column) => column.formatter(item));

export const getGenericColumns = () => [
  { header: "Alias", formatter: formatAliasCell },
  { header: "Check Type", formatter: formatCheckTypeCell },
  { header: "Status", formatter: formatStatusCell },
  { header: "Frequency", formatter: formatFrequencyCell },
  { header: "Next Run", formatter: formatNextRunCell },
  { header: "Last Result", formatter: formatLastResultCell },
  { header: "Most Recent Alert", formatter: formatMostRecentAlertCell },
];

export const getTypeSpecificColumns = (checkType: CheckType) => {
  const genericColumns = getGenericColumns();
  switch (checkType) {
    case "KEYWORD CHECK":
      return [
        ...genericColumns,
        { header: "Keyword", formatter: formatKeywordCell },
      ];
    case "EBAY PRICE THRESHOLD":
      return [
        ...genericColumns,
        { header: "Target Price", formatter: formatTargetPriceCell },
      ];
    case "PAGE DIFFERENCE":
      return [
        ...genericColumns,
        { header: "Target Percent Diff", formatter: formatDiffPercentageCell },
      ];
    case "AI CHECK":
      return [
        ...genericColumns,
        { header: "Alert Condition", formatter: formatAiAlertConditionCell },
      ];
    default:
      return genericColumns;
  }
};

const defaultTooltipClassName =
  "flex flex-col justify-center items-center gap-1 p-1";

// Define column widths
const columnWidths = {
  alias: "w-[200px]",
  checkType: "w-[150px]",
  status: "w-[100px]",
  frequency: "w-[120px]",
  nextRun: "w-[150px]",
  lastResult: "w-[200px]",
  mostRecentAlert: "w-[150px]",
  keyword: "w-[150px]",
  targetPrice: "w-[120px]",
  diffPercentage: "w-[150px]",
};

// Style for text wrapping with ellipsis
const ellipsisStyle = "truncate text-elipsis text-start";

const formatAliasCell = (item: CheckItem) => {
  const alias = item.alias;
  const url = item.url;

  const getCellContent = () => {
    return (
      <div className={`flex flex-col items-start`}>
        <div
          className={`text-ellipsis cursor-auto select-text ${ellipsisStyle} ${columnWidths.alias}`}
        >
          {alias ?? emptyDash}
        </div>
        <div
          className={`text-xs text-gray-500 ${ellipsisStyle} ${columnWidths.alias}`}
        >
          <a className={`hover:text-gray-400 hover:underline`} href={url}>
            {url ?? emptyDash}
          </a>
        </div>
      </div>
    );
  };

  const getTooltipContent = () => {
    return (
      <div className={cn(defaultTooltipClassName)}>
        <div className="text-ellipsis cursor-auto select-text">
          {alias ?? emptyDash}
        </div>
        <a className="hover:text-gray-400 underline text-ellipsis" href={url}>
          {url ?? emptyDash}
        </a>
      </div>
    );
  };

  const cellContent = getCellContent();
  const tooltipContent = getTooltipContent();

  return (
    <TableCell className={columnWidths.alias}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>{cellContent}</TooltipTrigger>
          <TooltipContent>{tooltipContent}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </TableCell>
  );
};

const formatCheckTypeCell = (item: CheckItem) => (
  <TableCell className={columnWidths.checkType}>
    <div className="flex gap-2 items-center truncate">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <InfoCircledIcon />
          </TooltipTrigger>
          <TooltipContent>
            {checkTypeDescriptions[item.checkType] ?? emptyDash}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <span className="truncate">{item.checkType ?? emptyDash}</span>
    </div>
  </TableCell>
);

const formatStatusCell = (item: CheckItem) => {
  const status = item.status;

  return (
    <TableCell className={columnWidths.status}>
      <StatusBadge status={status} />
    </TableCell>
  );
};

const formatFrequencyCell = (item: CheckItem) => {
  const delayMs = item.delayMs;
  const cron = item.cron;

  const getCellContent = () => {
    return delayMs !== null ? msToTimeStr(delayMs) : emptyDash;
  };

  const getTooltipContent = () => {
    if (delayMs !== null && cron !== null) {
      return `Runs: ${cronToPlainText(cron)}`;
    }
    return null;
  };

  const cellContent = getCellContent();
  const tooltipContent = getTooltipContent();

  return (
    <TableCell className={columnWidths.frequency}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger className="text-start cursor-auto select-text truncate">
            {cellContent}
          </TooltipTrigger>
          {tooltipContent && <TooltipContent>{tooltipContent}</TooltipContent>}
        </Tooltip>
      </TooltipProvider>
    </TableCell>
  );
};

const formatNextRunCell = (item: CheckItem) => {
  const delayMs = item.delayMs;
  const status = item.status;
  const cron = item.cron;
  const lastExecutedAt = item.lastResult?.timestamp;

  const nextRunDate = getNextRunTimeFromCron(cron);
  const isHappeningNow = lastExecutedAt
    ? isHappeningNowFromCron(lastExecutedAt, cron)
    : false;

  const getCellContent = () => {
    if (status !== "ACTIVE" || cron === null || delayMs === null) {
      return emptyDash;
    }
    if (isHappeningNow) {
      return loadingDots;
    }
    return nextRunDate ? toSentenceCase(getTimeAgo(nextRunDate)) : emptyDash;
  };

  const getTooltipContent = () => {
    if (status === "ACTIVE") {
      return formatDateWithTimezone(nextRunDate);
    }
    return null;
  };

  const cellContent = getCellContent();
  const tooltipContent = getTooltipContent();

  return (
    <TableCell className={columnWidths.nextRun}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger className="text-start cursor-auto select-text truncate">
            {cellContent}
          </TooltipTrigger>
          {tooltipContent && <TooltipContent>{tooltipContent}</TooltipContent>}
        </Tooltip>
      </TooltipProvider>
    </TableCell>
  );
};

const formatLastResultCell = (item: CheckItem) => {
  const status = item.lastResult?.status;
  const message = item.lastResult?.message;
  const timestamp = item.lastResult?.timestamp;
  const email = item.email;

  const statusToBadgeColor: Record<string, string> = {
    ALERTED: "GREEN",
    "NO ALERT": "GRAY",
    FAILED: "RED",
  };

  return (
    <TableCell className={columnWidths.lastResult}>
      {!status ? (
        emptyDash
      ) : (
        <div className="flex flex-col items-start gap-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger className="cursor-auto select-text truncate">
                <Badge
                  className={cn(
                    BADGE_COLOR_CLASS[statusToBadgeColor[status]],
                    "truncate"
                  )}
                >
                  {toSentenceCase(status)}
                </Badge>
              </TooltipTrigger>
              {email && status === "ALERTED" && (
                <TooltipContent>
                  <>
                    <p>{message}</p>
                    <p>Email sent to {email}</p>
                  </>
                </TooltipContent>
              )}
              {message &&
                message != "Message" &&
                (status === "FAILED" || status === "NO ALERT") && (
                  <TooltipContent>{message}</TooltipContent>
                )}
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger className="cursor-auto select-text text-sm text-gray-500 text-start truncate">
                {timestamp ? "Last ran " + getTimeAgo(timestamp) : emptyDash}
              </TooltipTrigger>
              <TooltipContent>
                {timestamp ? formatDateWithTimezone(timestamp) : emptyDash}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      )}
    </TableCell>
  );
};

const formatMostRecentAlertCell = (item: CheckItem) => {
  return (
    <TableCell className={columnWidths.mostRecentAlert}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger className="text-start cursor-auto select-text truncate">
            {item.mostRecentAlert ? (
              <Badge className={cn(BADGE_COLOR_CLASS.GREEN, "truncate")}>
                {getTimeAgo(item.mostRecentAlert)}
              </Badge>
            ) : (
              emptyDash
            )}
          </TooltipTrigger>
          {item.mostRecentAlert && (
            <TooltipContent>
              {formatDateWithTimezone(item.mostRecentAlert)}
            </TooltipContent>
          )}
        </Tooltip>
      </TooltipProvider>
    </TableCell>
  );
};

const formatKeywordCell = (item: CheckItem) => (
  <TableCell className={`${columnWidths.keyword} truncate`}>
    {("keyword" in item.attributes && item.attributes.keyword) ?? emptyDash}
  </TableCell>
);

const formatTargetPriceCell = (item: CheckItem) => (
  <TableCell className={`${columnWidths.targetPrice} truncate`}>
    {"threshold" in item.attributes && item.attributes.threshold
      ? `$${item.attributes.threshold}`
      : emptyDash}
  </TableCell>
);

const formatDiffPercentageCell = (item: CheckItem) => (
  <TableCell className={`${columnWidths.diffPercentage} truncate`}>
    {"percent_diff" in item.attributes && item.attributes.percent_diff
      ? `${item.attributes.percent_diff}%`
      : emptyDash}
  </TableCell>
);

const formatAiAlertConditionCell = (item: CheckItem) => (
  <TableCell className={`${columnWidths.diffPercentage} truncate`}>
    {"userCondition" in item.attributes && item.attributes.userCondition
      ? item.attributes.userCondition
      : emptyDash}
  </TableCell>
);
