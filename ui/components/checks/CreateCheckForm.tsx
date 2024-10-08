import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useForm, useWatch } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { convertToCron, cronToPlainText } from "@/lib/checks/utils";
import { Switch } from "@/components/ui/switch";
import { createCheckFormSchema } from "@/lib/checks/schema";
import { InfoTooltip } from "../custom/InfoTooltip";
import { CheckItem } from "@/lib/types";

const columnLayout = {
  left: ["checkType", "attributes", "useProxy"],
  right: ["url", "alias", "email", "delayMs", "offset", "dayOfWeek"],
};

const frequencyOptions = [
  { label: "5 minutes", value: 300000 },
  { label: "10 minutes", value: 600000 },
  { label: "30 minutes", value: 1800000 },
  { label: "1 hour", value: 3600000 },
  { label: "4 hours", value: 14400000 },
  { label: "12 hours", value: 43200000 },
  { label: "1 day", value: 86400000 },
  { label: "1 week", value: 604800000 },
];

const dayOfWeekOptions = [
  { label: "Sunday", value: "0" },
  { label: "Monday", value: "1" },
  { label: "Tuesday", value: "2" },
  { label: "Wednesday", value: "3" },
  { label: "Thursday", value: "4" },
  { label: "Friday", value: "5" },
  { label: "Saturday", value: "6" },
];

const checkTypeOptions = [
  { label: "KEYWORD CHECK", value: "KEYWORD CHECK" },
  { label: "EBAY PRICE THRESHOLD", value: "EBAY PRICE THRESHOLD" },
  { label: "PAGE DIFFERENCE", value: "PAGE DIFFERENCE" },
  { label: "AI CHECK", value: "AI CHECK" },
];

interface CreateCheckFormProps {
  handleCreateItemSubmit: (
    values: z.infer<typeof createCheckFormSchema>
  ) => void;
}

const CreateCheckForm: React.FC<CreateCheckFormProps> = ({
  handleCreateItemSubmit,
}) => {
  const { data: session, status } = useSession();
  const [cronDescription, setCronDescription] = useState("");

  const form = useForm<Partial<z.infer<typeof createCheckFormSchema>>>({
    resolver: zodResolver(createCheckFormSchema),
    defaultValues: {
      userid: undefined,
      type: "CHECK",
      checkType: undefined,
      url: undefined,
      useProxy: false,
      alias: undefined,
      email: undefined,
      delayMs: 14400000,
      attributes: {},
      cron: undefined,
      lastResult: null,
      mostRecentAlert: null,
      status: "ACTIVE",
    },
  });

  const checkType = useWatch({ control: form.control, name: "checkType" });
  const delayMs = useWatch({ control: form.control, name: "delayMs" });
  const offset = useWatch({ control: form.control, name: "offset" });
  const dayOfWeek = useWatch({ control: form.control, name: "dayOfWeek" });

  useEffect(() => {
    if (status === "authenticated" && session.user.id) {
      form.setValue("userid", session.user.id);
    }
  }, [status, session]);

  useEffect(() => {
    const cronExpression = convertToCron(delayMs ?? 0, offset, dayOfWeek);
    const description = cronToPlainText(cronExpression);
    form.setValue("cron", cronExpression);
    setCronDescription(description);
  }, [delayMs, offset, dayOfWeek]);

  useEffect(() => {
    if (checkType === "KEYWORD CHECK") {
      form.setValue("attributes", { keyword: undefined, opposite: false });
    } else if (checkType === "EBAY PRICE THRESHOLD") {
      form.setValue("attributes", { threshold: undefined });
    } else if (checkType === "PAGE DIFFERENCE") {
      form.setValue("attributes", { percent_diff: undefined });
    } else if (checkType === "AI CHECK") {
      form.setValue("attributes", {
        model: undefined,
        userPrompt: undefined,
        userCondition: undefined,
      });
    }
  }, [checkType]);

  function onSubmit(values: Partial<z.infer<typeof createCheckFormSchema>>) {
    console.log(values);
    handleCreateItemSubmit(values as z.infer<typeof createCheckFormSchema>);
  }

  const renderFormFields = (column: "left" | "right") => {
    return columnLayout[column].map((fieldName) => {
      switch (fieldName) {
        case "checkType":
          return (
            <FormField
              key={fieldName}
              control={form.control}
              name="checkType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Check type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Check Type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {checkTypeOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          );
        case "attributes":
          return (
            <React.Fragment key={fieldName}>
              {form.watch("checkType") === "KEYWORD CHECK" && (
                <>
                  <FormField
                    control={form.control}
                    name="attributes.keyword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          <div className="flex items-center">
                            Keyword
                            <InfoTooltip text="Not case sensitive." />
                          </div>
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="Keyword" {...field} />
                        </FormControl>
                        <FormDescription>Keyword to check for.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="attributes.opposite"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            Check for absence of keyword
                          </FormLabel>
                          <FormDescription>
                            False to alert when keyword exists, true to alert
                            when keyword does not exist.
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </>
              )}
              {form.watch("checkType") === "EBAY PRICE THRESHOLD" && (
                <FormField
                  control={form.control}
                  name="attributes.threshold"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price Threshold</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Price"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseFloat(e.target.value) || "")
                          }
                        />
                      </FormControl>
                      <FormDescription>
                        Alerts when a price is found lower than this. Checks
                        "Buy It Now" prices on a given Ebay URL.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              {form.watch("checkType") === "PAGE DIFFERENCE" && (
                <FormField
                  control={form.control}
                  name="attributes.percent_diff"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        <div className="flex items-center">
                          Percent Difference
                          <InfoTooltip text="Uses levenshtein distance to calculate percent change between last check and current check." />
                        </div>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Percent Difference"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseFloat(e.target.value) || "")
                          }
                        />
                      </FormControl>
                      <FormDescription>
                        Checks percent difference between current website and
                        its content when it was most previously checked, alerts
                        if percent met.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              {form.watch("checkType") === "AI CHECK" && (
                <>
                  <FormField
                    control={form.control}
                    name="attributes.model"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Model</FormLabel>
                        <Select
                          onValueChange={(value) => field.onChange(value)}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select Model" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="openai">
                              OpenAI GPT-4o-Mini
                            </SelectItem>
                            <SelectItem value="anthropic">
                              Anthropic Claude 3.5 Sonnet
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="attributes.userPrompt"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Prompt</FormLabel>
                        <FormControl>
                          <Input placeholder="Prompt" {...field} />
                        </FormControl>
                        <FormDescription>
                          Prompt to send to AI model for completion. For
                          example, "Analyze this website for spelling errors."
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="attributes.userCondition"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Alert Condition</FormLabel>
                        <FormControl>
                          <Input placeholder="Alert Condition" {...field} />
                        </FormControl>
                        <FormDescription>
                          Condition to check for in AI model completion. For
                          example, "Notify me if spelling errors found".
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}
            </React.Fragment>
          );
        case "url":
          return (
            <FormField
              key={fieldName}
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL</FormLabel>
                  <FormControl>
                    <Input placeholder="URL" {...field} />
                  </FormControl>
                  <FormDescription>
                    Website to perform check on.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          );
        case "useProxy":
          return (
            <FormField
              key={fieldName}
              control={form.control}
              name="useProxy"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Use Proxy</FormLabel>
                    <FormDescription>
                      Uses proxy to fetch website content for better success
                      rate. Disabled for free users.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={
                        session?.user.userType === "default"
                          ? false
                          : field.value
                      }
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          );
        case "alias":
          return (
            <FormField
              key={fieldName}
              control={form.control}
              name="alias"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Alias</FormLabel>
                  <FormControl>
                    <Input placeholder="Alias" {...field} />
                  </FormControl>
                  <FormDescription>
                    Title/nickname to show for email notifications.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          );
        case "email":
          return (
            <FormField
              key={fieldName}
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="Email" {...field} />
                  </FormControl>
                  <FormDescription>Destination for alerts.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          );
        case "delayMs":
          return (
            <FormField
              key={fieldName}
              control={form.control}
              name="delayMs"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Frequency</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(Number(value))}
                    defaultValue={field.value?.toString()}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Frequency" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {frequencyOptions.map((option) => (
                        <SelectItem
                          key={option.value}
                          value={option.value.toString()}
                          disabled={
                            session?.user.userType === "default" &&
                            option.value < 14400000
                          }
                        >
                          {option.label}{" "}
                          {session?.user.userType === "default" &&
                            option.value < 14400000 &&
                            "(Premium)"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    How frequently to run the check
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          );
        case "offset":
          return (
            (form.watch("delayMs") ?? 0) >= 14400000 && (
              <FormField
                key={fieldName}
                control={form.control}
                name="offset"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Offset (hours)</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(Number(value))}
                      defaultValue={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Offset" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Array.from(
                          { length: (form.watch("delayMs") ?? 0) / 3600000 },
                          (_, i) => (
                            <SelectItem key={i} value={i.toString()}>
                              {i} hour{i !== 1 ? "s" : ""}
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Add an offset for which hour(s) the check runs
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )
          );
        case "dayOfWeek":
          return (
            form.watch("delayMs") === 604800000 && (
              <FormField
                key={fieldName}
                control={form.control}
                name="dayOfWeek"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Day of Week</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Day of Week" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {dayOfWeekOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Day of the week to run the check
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )
          );
        default:
          return null;
      }
    });
  };

  return (
    <Form {...form}>
      <form
        noValidate
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-8"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-8">{renderFormFields("left")}</div>
          <div className="space-y-8">{renderFormFields("right")}</div>
        </div>
        <div className="flex flex-col justify-center items-center gap-4">
          <Button type="submit" className="w-96 text-lg">
            Submit
          </Button>
          <p className="text-gray-400">
            Check will run{" "}
            {(form.watch("delayMs") ?? 0) > 60 * 60 * 1000 &&
              (form.watch("delayMs") ?? 0) < 7 * 24 * 60 * 60 * 1000 &&
              "daily (UTC)"}{" "}
            {cronDescription.charAt(0).toLowerCase() + cronDescription.slice(1)}
          </p>
        </div>
      </form>
    </Form>
  );
};

export default CreateCheckForm;
