import { z } from "zod";

export const createItemFormSchema = z
  .object({
    userid: z.string(),
    type: z.string(),
    check_type: z.string().min(1),
    url: z.string().url().min(1).max(255),
    useProxy: z.boolean(),
    alias: z.string().min(1).max(100),
    email: z.string().email().min(1).max(255),
    delayMs: z.number(),
    attributes: z.object({
      percent_diff: z.number().min(0).max(100).optional(),
      keyword: z.string().max(255).optional(),
      opposite: z.boolean().optional(),
      threshold: z.number().min(0).max(1000000000).optional(),
    }),
    offset: z.number().optional(),
    dayOfWeek: z.string().optional(),
    cron: z.string(),
    lastResult: z.null(),
    mostRecentAlert: z.null(),
    status: z.string(),
  })
  .superRefine((data, ctx) => {
    // Offset required if >1 hr
    if (data.delayMs > 60 * 60 * 1000) {
      if (data.offset === undefined) {
        ctx.addIssue({
          path: ["offset"],
          message: "Offset is required.",
          code: "invalid_literal",
          expected: undefined,
          received: undefined,
        });
      }
    }

    if (data.check_type === "KEYWORD CHECK") {
      if (data.attributes.keyword === undefined) {
        ctx.addIssue({
          path: ["attributes", "keyword"],
          message: "Keyword is required.",
          code: "invalid_literal",
          expected: undefined,
          received: undefined,
        });
      }
    }

    if (data.check_type === "PAGE DIFFERENCE") {
      if (data.attributes.percent_diff === undefined) {
        ctx.addIssue({
          path: ["attributes", "percent_diff"],
          message: "Percent_diff is required.",
          code: "invalid_literal",
          expected: undefined,
          received: undefined,
        });
      }
    }

    if (data.check_type === "EBAY PRICE THRESHOLD") {
      if (data.attributes.threshold === undefined) {
        ctx.addIssue({
          path: ["attributes", "threshold"],
          message: "Threshold is required.",
          code: "invalid_literal",
          expected: undefined,
          received: undefined,
        });
      }
    }
  });
