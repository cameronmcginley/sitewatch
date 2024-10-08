import util from "util";
import chalk from "chalk";
import axios from "axios";
import { CheckItem } from "@/lib/types";

export function prettyLog(label: string, obj: any): void {
  const formattedObj = util.inspect(obj, {
    colors: true,
    depth: null,
    compact: false,
  });

  console.log(
    `${chalk.bgBlue(new Date().toLocaleString())} : ${chalk.blue(
      label
    )} : ${formattedObj}`
  );
}

const formatAttributes = (
  attributes: Record<string, any> | undefined
): string => {
  if (!attributes) {
    return "";
  }
  return Object.entries(attributes)
    .map(([key, value]) => `      ${key}: ${value}`)
    .join("\n");
};

interface User {
  id: string;
}

export const dlog = (
  item: CheckItem | any,
  user: User,
  created: boolean = false,
  deleted: boolean = false,
  updated: boolean = false
): void => {
  const stage = process.env.NEXT_PUBLIC_STAGE || "dev";
  if (stage === "dev") {
    return;
  }

  const message = `
  Item ${created ? "Created" : deleted ? "Deleted" : "Updated"}:
  User: {
    id: ${user.id}
  }
  CheckItem: {
    PK: ${item.pk}
    SK: ${item.sk}
    Alias: ${item.alias}
    CheckType: ${item.checkType}
    Attributes:
${formatAttributes(item.attributes)}
    URL: ${item.url}
    DelayMs: ${item.delayMs}
    Cron: ${item.cron}
  }
  -----------------------------------------------------------
  `;
  axios.post(process.env.NEXT_PUBLIC_HOOK_UPDATE_ITEM || "", {
    content: message,
  });
};
