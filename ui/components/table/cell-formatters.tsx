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
  formatFrequency,
} from "./utils";

const formatAliasCell = (item) => (
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
);

const formatCheckTypeCell = (item) => (
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
);

const formatStatusCell = (item) => (
  <TableCell>
    <Badge
      className={
        item.status?.S === "ACTIVE"
          ? "bg-green-700 text-white hover:bg-green-700"
          : "bg-yellow-700 text-white hover:bg-yellow-700"
      }
    >
      {toSentenceCase(item.status?.S) ?? emptyDash}
    </Badge>
  </TableCell>
);

const formatFrequencyCell = (item) => (
  <TableCell>
    {item.delayMs?.S ? formatFrequency(Number(item.delayMs.S)) : emptyDash}
  </TableCell>
);

const formatNextRunCell = (item) => {
  const lastExecutedAt = item.lastExecutedAt?.S;
  const delayMs = item.delayMs?.S;

  const getCellContent = () => {
    if (!lastExecutedAt || !delayMs) {
      return emptyDash;
    }
    if (isHappeningNow(lastExecutedAt, delayMs)) {
      return loadingDots;
    }
    const nextRunDate = getNextRunDate(lastExecutedAt, delayMs);
    return nextRunDate ? `In ${getTimeAgo(nextRunDate)}` : emptyDash;
  };

  const getTooltipContent = () => {
    if (lastExecutedAt && delayMs && !isHappeningNow(lastExecutedAt, delayMs)) {
      const nextRunDate = getNextRunDate(lastExecutedAt, delayMs);
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

const formatLastResultCell = (item) => (
  <TableCell>
    <div className="flex flex-col items-start gap-1">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger className="cursor-auto select-text">
            <Badge
              className={
                item.lastResult?.S === "ALERTED"
                  ? "bg-green-700 text-white hover:bg-green-700"
                  : "bg-gray-700 text-white hover:bg-gray-700"
              }
            >
              {toSentenceCase(item.lastResult?.S)}
            </Badge>
          </TooltipTrigger>
          {item.email?.S && item.lastResult?.S === "ALERTED" && (
            <TooltipContent>Email sent to {item.email?.S}</TooltipContent>
          )}
        </Tooltip>
      </TooltipProvider>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger className="cursor-auto select-text text-sm text-gray-500 text-start">
            {item.lastExecutedAt?.S
              ? "Last ran " + getTimeAgo(item.lastExecutedAt?.S)
              : emptyDash}
          </TooltipTrigger>
          <TooltipContent>
            {item.lastExecutedAt?.S
              ? formatDateWithTimezone(item.lastExecutedAt?.S)
              : emptyDash}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  </TableCell>
);

const formatMostRecentAlertCell = (item) => (
  <TableCell>
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger className="text-start cursor-auto select-text">
          {item.mostRecentAlert?.S ? (
            <Badge className="bg-green-700 text-white hover:bg-green-700">
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

export const formatCells = (item, columns) =>
  columns.map((column) => column.formatter(item));
