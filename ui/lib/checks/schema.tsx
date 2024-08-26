import { z } from "zod";

export const createCheckFormSchema = z
  .object({
    userid: z.string().trim().min(1).max(100),
    type: z.string().trim().min(1).max(50),
    checkType: z.enum([
      "KEYWORD CHECK",
      "PAGE DIFFERENCE",
      "EBAY PRICE THRESHOLD",
      "AI CHECK",
    ]),
    url: z.string().url().trim().min(1).max(255),
    useProxy: z.boolean(),
    alias: z.string().trim().min(1).max(100),
    email: z.string().email().trim().min(1).max(255),
    delayMs: z.number().int().min(1000).max(86400000000),
    attributes: z.object({
      percent_diff: z.number().min(0).max(100).optional(),
      keyword: z.string().trim().max(255).optional(),
      opposite: z.boolean().optional(),
      threshold: z.number().min(0).max(1000000000).optional(),
      userPrompt: z.string().trim().max(1000).optional(),
      userCondition: z.string().trim().max(255).optional(),
      model: z.string().trim().max(255).optional(),
    }),
    offset: z.number().int().optional(),
    dayOfWeek: z.string().optional(),
    cron: z.string().max(100),
    lastResult: z.null(),
    mostRecentAlert: z.null(),
    status: z.enum(["ACTIVE", "PAUSED"]),
  })
  .superRefine((data, ctx) => {
    // Offset required if >1 hr
    if (data.delayMs > 60 * 60 * 1000) {
      if (data.offset === undefined) {
        ctx.addIssue({
          path: ["offset"],
          message: "Offset is required for delays greater than 1 hour.",
          code: "custom",
        });
      }
    }

    if (data.checkType === "KEYWORD CHECK") {
      if (data.attributes.keyword === undefined) {
        ctx.addIssue({
          path: ["attributes", "keyword"],
          message: "Keyword is required for KEYWORD CHECK.",
          code: "custom",
        });
      }
    }

    if (data.checkType === "PAGE DIFFERENCE") {
      if (data.attributes.percent_diff === undefined) {
        ctx.addIssue({
          path: ["attributes", "percent_diff"],
          message: "Percent is required for PAGE DIFFERENCE.",
          code: "custom",
        });
      }
    }

    if (data.checkType === "EBAY PRICE THRESHOLD") {
      if (data.attributes.threshold === undefined) {
        ctx.addIssue({
          path: ["attributes", "threshold"],
          message: "Threshold is required for EBAY PRICE THRESHOLD.",
          code: "custom",
        });
      }
    }

    if (data.checkType === "AI CHECK") {
      if (data.delayMs < 30 * 60 * 1000) {
        ctx.addIssue({
          path: ["delayMs"],
          message: "Delay must be at least 30 minutes for AI CHECK.",
          code: "custom",
        });
      }
      if (data.attributes.userPrompt === undefined) {
        ctx.addIssue({
          path: ["attributes", "userPrompt"],
          message: "Prompt required for AI CHECK.",
          code: "custom",
        });
      }
      if (data.attributes.userCondition === undefined) {
        ctx.addIssue({
          path: ["attributes", "userCondition"],
          message: "Condition required for AI CHECK.",
          code: "custom",
        });
      }
      if (data.attributes.model === undefined) {
        ctx.addIssue({
          path: ["attributes", "model"],
          message: "Model required for AI CHECK.",
          code: "custom",
        });
      }
    }

    const sanitizedUrl = data.url.replace(/[<>"']/g, "");
    if (sanitizedUrl !== data.url) {
      ctx.addIssue({
        path: ["url"],
        message: "URL contains invalid characters.",
        code: "custom",
      });
    }
  });
