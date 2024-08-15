import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useForm } from "react-hook-form";
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
import { convertToCron, cronToPlainText } from "../table/utils";
import { Switch } from "@/components/ui/switch";
import { useWatch } from "react-hook-form";
import { createItemFormSchema } from "./schema";

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
];

const ItemForm = ({ handleCreateItemSubmit }) => {
  const { data: session, status } = useSession();
  const [cronDescription, setCronDescription] = useState("");

  const form = useForm<z.infer<typeof createItemFormSchema>>({
    resolver: zodResolver(createItemFormSchema),
    defaultValues: {
      userid: "",
      type: "CHECK",
      check_type: "",
      url: "",
      useProxy: false,
      alias: "",
      email: "",
      delayMs: 14400000,
      attributes: {},
      cron: "",
      lastResult: null,
      mostRecentAlert: null,
      status: "ACTIVE",
    },
  });

  const checkType = useWatch({ control: form.control, name: "check_type" });
  const delayMs = useWatch({ control: form.control, name: "delayMs" });
  const offset = useWatch({ control: form.control, name: "offset" });
  const dayOfWeek = useWatch({ control: form.control, name: "dayOfWeek" });

  useEffect(() => {
    if (status === "authenticated" && session?.user?.id) {
      form.setValue("userid", session.user.id);
    }
  }, [status, session]);

  useEffect(() => {
    console.log(form.getValues());
    const cronExpression = convertToCron(delayMs, offset, dayOfWeek);
    const description = cronToPlainText(cronExpression);
    form.setValue("cron", cronExpression);
    setCronDescription(description);
  }, [delayMs, offset, dayOfWeek]);

  useEffect(() => {
    if (checkType === "KEYWORD CHECK") {
      form.setValue("attributes", {});
      form.setValue("attributes.keyword", undefined);
      form.setValue("attributes.opposite", false);
    } else if (checkType === "EBAY PRICE THRESHOLD") {
      form.setValue("attributes", {});
      form.setValue("attributes.threshold", undefined);
    } else if (checkType === "PAGE DIFFERENCE") {
      form.setValue("attributes", {});
      form.setValue("attributes.percent_diff", undefined);
    }
  }, [checkType]);

  function onSubmit(values: z.infer<typeof createItemFormSchema>) {
    console.log(values);
    handleCreateItemSubmit(values);
  }

  return (
    <Form {...form}>
      <form
        noValidate
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-8"
      >
        <FormField
          control={form.control}
          name="check_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Check type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
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
              <FormDescription></FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* Attribute fields */}
        {form.watch("check_type") === "KEYWORD CHECK" && (
          <>
            <FormField
              control={form.control}
              name="attributes.keyword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Keyword</FormLabel>
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
                      False to alert when keyword exists, true to alert when
                      keyword does not exist.
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
        {form.watch("check_type") === "EBAY PRICE THRESHOLD" && (
          <FormField
            control={form.control}
            name="attributes.threshold"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price Threshold</FormLabel>
                <FormControl>
                  <Input placeholder="Price" {...field} />
                </FormControl>
                <FormDescription>
                  Alerts when a price is found lower than this. Checks "Buy It
                  Now" prices on a given Ebay URL.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        {form.watch("check_type") === "PAGE DIFFERENCE" && (
          <FormField
            control={form.control}
            name="attributes.percent_diff"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Percent Difference</FormLabel>
                <FormControl>
                  <Input placeholder="Percent Difference" {...field} />
                </FormControl>
                <FormDescription>
                  Checks percent difference between current website and its
                  content when it was most previously checked, alerts if percent
                  met.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        <FormField
          control={form.control}
          name="url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL</FormLabel>
              <FormControl>
                <Input placeholder="URL" {...field} />
              </FormControl>
              <FormDescription>Website to perform check on.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="useProxy"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Use Proxy</FormLabel>
                <FormDescription>
                  Uses proxy to fetch website content for better success rate.
                  Disabled for free users.
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={
                    session?.user?.userType === "default" ? false : field.value
                  }
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="alias"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Alias</FormLabel>
              <FormControl>
                <Input placeholder="Alias" {...field} />
              </FormControl>
              <FormDescription>
                Website nickname to show for email notifications.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
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
        <FormField
          control={form.control}
          name="delayMs"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Frequency</FormLabel>
              <Select
                onValueChange={(value) => field.onChange(Number(value))}
                defaultValue={field.value.toString()}
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
                        session?.user?.userType === "default" &&
                        option.value < 14400000
                      }
                    >
                      {option.label}{" "}
                      {session?.user?.userType === "default" &&
                        option.value < 14400000 &&
                        "(Premium)"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>How frequently to run the check</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        {form.watch("delayMs") >= 14400000 && (
          <FormField
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
                      { length: form.watch("delayMs") / 3600000 },
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
        )}
        {form.watch("delayMs") === 604800000 && (
          <FormField
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
        )}
        <Button type="submit">Submit</Button>
        <p className="text-gray-400">
          Runs{" "}
          {delayMs > 60 * 60 * 1000 &&
            delayMs < 7 * 24 * 60 * 60 * 1000 &&
            "Daily (UTC Time)"}{" "}
          {cronDescription}
        </p>
      </form>
    </Form>
  );
};

export default ItemForm;
