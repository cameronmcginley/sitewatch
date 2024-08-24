"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { BADGE_COLOR_CLASS } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import { emptyDash } from "@/components/checks/table/constants";
import { toSentenceCase } from "@/lib/checks/utils";
import { CheckStatus } from "@/lib/types";

interface StatusBadgeProps {
  status: CheckStatus;
}

export const StatusBadge = ({ status }: StatusBadgeProps): JSX.Element => {
  const statusToBadgeColor: Record<string, string> = {
    ACTIVE: "GREEN",
    PAUSED: "YELLOW",
  };

  return (
    <Badge
      className={cn(BADGE_COLOR_CLASS[statusToBadgeColor[status]], "truncate")}
    >
      {toSentenceCase(status) ?? emptyDash}
    </Badge>
  );
};
