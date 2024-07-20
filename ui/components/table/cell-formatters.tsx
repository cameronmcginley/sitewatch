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
import { check_type_descriptions, emptyDash, loadingDots } from "./constants";
import {
  toSentenceCase,
  getNextRunDate,
  isHappeningNow,
  formatDateWithTimezone,
  getTimeAgo,
  msToTimeStr,
  formatTimeWithTimezone,
  getNextRunTimeFromCron,
  isHappeningNowFromCron,
  cronToPlainText,
} from "./utils";
import { cn } from "@/lib/utils";
import { BADGE_COLOR_CLASS } from "@/lib/constants";
import { time } from "console";

export const formatCells = (item, columns) =>
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

export const getTypeSpecificColumns = (checkType) => {
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
    default:
      return genericColumns;
  }
};

const defaultTooltipClassName =
  "flex flex-col justify-center items-center gap-1 p-1";

const formatAliasCell = (item) => {
  const alias = item.alias?.S;
  const url = item.url?.S;

  const getCellContent = () => {
    return (
      <div className="flex flex-col items-start">
        <div className="text-ellipsis cursor-auto select-text">
          {alias ?? emptyDash}
        </div>
        <div className="text-xs text-gray-500 text-ellipsis">
          <a
            className="hover:text-gray-400 hover:underline text-ellipsis"
            href={url}
          >
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
    <TableCell>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>{cellContent}</TooltipTrigger>
          <TooltipContent>{tooltipContent}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </TableCell>
  );
};

const formatCheckTypeCell = (item) => (
  <TableCell>
    <div className="flex gap-2 items-center">
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
      {item.check_type?.S ?? emptyDash}
    </div>
  </TableCell>
);

const formatStatusCell = (item) => {
  const status = item.status?.S;

  const statusToBadgeColor: Record<string, string> = {
    ACTIVE: "GREEN",
    PAUSED: "YELLOW",
  };

  return (
    <TableCell>
      <Badge className={cn(BADGE_COLOR_CLASS[statusToBadgeColor[status]])}>
        {toSentenceCase(item.status?.S) ?? emptyDash}
      </Badge>
    </TableCell>
  );
};

const formatFrequencyCell = (item) => {
  const delayMs = item.delayMs?.N;
  // const startHour = item.startHour?.N;
  const cron = item.cron?.S;

  // Don't show start hour if runs every 1 hour or less
  // const showStartHour = delayMs !== null && delayMs > 3600000;

  const getCellContent = () => {
    return delayMs !== null ? msToTimeStr(delayMs) : emptyDash;
  };

  const getTooltipContent = () => {
    if (delayMs !== null && cron !== null) {
      const baseContent = `Runs: ${cronToPlainText(cron)} (${cron})`;

      return baseContent;
    }
    return null;
  };

  const cellContent = getCellContent();
  const tooltipContent = getTooltipContent();

  return (
    <TableCell>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger className="text-start cursor-auto select-text">
            {cellContent}
          </TooltipTrigger>
          {tooltipContent && <TooltipContent>{tooltipContent}</TooltipContent>}
        </Tooltip>
      </TooltipProvider>
    </TableCell>
  );
};

const formatNextRunCell = (item) => {
  const lastExecutedAt = item.lastResult?.M.timestamp.S;
  const delayMs = item.delayMs?.N;
  // const startHour = item.startHour?.N;
  const status = item.status?.S;
  const cron = item.cron?.S;

  const nextRunDate = getNextRunTimeFromCron(cron);
  const isHappening = isHappeningNowFromCron(lastExecutedAt, cron);

  const getCellContent = () => {
    if (status !== "ACTIVE" || cron === null || delayMs === null) {
      return emptyDash;
    }
    if (isHappening) {
      return loadingDots;
    }
    return nextRunDate ? toSentenceCase(getTimeAgo(nextRunDate)) : emptyDash;
  };

  const getTooltipContent = () => {
    if (
      status === "ACTIVE" &&
      cron !== null &&
      delayMs !== null &&
      !isHappening
    ) {
      return formatDateWithTimezone(nextRunDate);
    }
    return null;
  };

  const cellContent = getCellContent();
  const tooltipContent = getTooltipContent();

  return (
    <TableCell>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger className="text-start cursor-auto select-text">
            {cellContent}
          </TooltipTrigger>
          {tooltipContent && <TooltipContent>{tooltipContent}</TooltipContent>}
        </Tooltip>
      </TooltipProvider>
    </TableCell>
  );
};

const formatLastResultCell = (item) => {
  const status = item.lastResult?.M.status.S;
  const message = item.lastResult?.M.message.S;
  const timestamp = item.lastResult?.M.timestamp.S;
  const email = item.email?.S;

  const statusToBadgeColor: Record<string, string> = {
    ALERTED: "GREEN",
    "NO ALERT": "GRAY",
    FAILED: "RED",
  };

  return (
    <TableCell>
      <div className="flex flex-col items-start gap-1">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger className="cursor-auto select-text">
              <Badge
                className={cn(BADGE_COLOR_CLASS[statusToBadgeColor[status]])}
              >
                {toSentenceCase(status)}
              </Badge>
            </TooltipTrigger>
            {email && status === "ALERTED" && (
              <TooltipContent>Email sent to {email}</TooltipContent>
            )}
            {message && status === "FAILED" && (
              <TooltipContent>{message}</TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger className="cursor-auto select-text text-sm text-gray-500 text-start">
              {timestamp ? "Last ran " + getTimeAgo(timestamp) : emptyDash}
            </TooltipTrigger>
            <TooltipContent>
              {timestamp ? formatDateWithTimezone(timestamp) : emptyDash}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </TableCell>
  );
};

const formatMostRecentAlertCell = (item) => {
  return (
    <TableCell className="w-0">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger className="w-32 text-start cursor-auto select-text">
            {item.mostRecentAlert?.S ? (
              <Badge className={cn(BADGE_COLOR_CLASS.GREEN)}>
                {getTimeAgo(item.mostRecentAlert?.S)}
              </Badge>
            ) : (
              emptyDash
            )}
          </TooltipTrigger>
          {item.mostRecentAlert?.S && (
            <TooltipContent>
              {formatDateWithTimezone(item.mostRecentAlert?.S)}
            </TooltipContent>
          )}
        </Tooltip>
      </TooltipProvider>
    </TableCell>
  );
};

const formatKeywordCell = (item) => (
  <TableCell>{item.keyword?.S ?? emptyDash}</TableCell>
);

const formatTargetPriceCell = (item) => (
  <TableCell>
    {item.attributes?.M.threshold?.N
      ? `$${item.attributes?.M.threshold.N}`
      : emptyDash}
  </TableCell>
);

const formatDiffPercentageCell = (item) => (
  <TableCell>
    {item.attributes?.M.percent_diff?.N
      ? `${item.attributes?.M.percent_diff.N}%`
      : emptyDash}
  </TableCell>
);
