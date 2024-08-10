// import React, { useState, useEffect } from "react";
// import { useSession } from "next-auth/react";
// import { CHECK_TYPES } from "@/lib/constants";
// import { convertToCron, cronToPlainText } from "../table/utils";
// import { Input } from "@/components/ui/input";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { Checkbox } from "@/components/ui/checkbox";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Label } from "@/components/ui/label";
// import { Slider } from "@/components/ui/slider";

// const frequencyOptions = [
//   { label: "5 minutes", value: 300000 },
//   { label: "10 minutes", value: 600000 },
//   { label: "30 minutes", value: 1800000 },
//   { label: "1 hour", value: 3600000 },
//   { label: "4 hours", value: 14400000 },
//   { label: "12 hours", value: 43200000 },
//   { label: "1 day", value: 86400000 },
//   { label: "1 week", value: 604800000 },
// ];

// const dayOfWeekOptions = [
//   { label: "Sunday", value: "0" },
//   { label: "Monday", value: "1" },
//   { label: "Tuesday", value: "2" },
//   { label: "Wednesday", value: "3" },
//   { label: "Thursday", value: "4" },
//   { label: "Friday", value: "5" },
//   { label: "Saturday", value: "6" },
// ];

// interface FormData {
//   userid: string;
//   type: string;
//   check_type: string;
//   url: string;
//   alias: string;
//   email: string;
//   delayMs: number;
//   attributes: {
//     percent_diff?: number;
//     keyword?: string;
//     opposite?: boolean;
//   };
//   offset?: number;
//   dayOfWeek?: string;
//   cron: string;
//   lastResult: null;
//   mostRecentAlert: null;
//   status: string;
// }

// const ItemForm: React.FC<{ onSubmit: (data: FormData) => void }> = ({
//   onSubmit,
// }) => {
//   const { data: session, status } = useSession();
//   const [formData, setFormData] = useState<FormData>({
//     userid: "",
//     type: "CHECK",
//     check_type: "",
//     url: "",
//     alias: "",
//     email: "",
//     delayMs: 4 * 60 * 60 * 1000,
//     attributes: {},
//     cron: "",
//     lastResult: null,
//     mostRecentAlert: null,
//     status: "ACTIVE",
//   });
//   const [cronDescription, setCronDescription] = useState("");
//   const [cronExpression, setCronExpression] = useState<string | null>(null);

//   useEffect(() => {
//     if (status === "authenticated" && session?.user?.id) {
//       setFormData((prev) => ({ ...prev, userid: session.user.id }));
//     }
//   }, [status, session]);

//   useEffect(() => {
//     const cronExpression = convertToCron(
//       formData.delayMs,
//       formData.offset,
//       formData.dayOfWeek
//     );
//     const description = cronToPlainText(cronExpression);
//     setCronExpression(cronExpression);
//     setCronDescription(description);
//     setFormData((prev) => ({ ...prev, cron: cronExpression }));
//   }, [formData.delayMs, formData.offset, formData.dayOfWeek]);

//   const handleInputChange = (name: string, value: any) => {
//     console.log(formData);
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleAttributeChange = (name: string, value: any) => {
//     setFormData((prev) => ({
//       ...prev,
//       attributes: { ...prev.attributes, [name]: value },
//     }));
//   };

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     onSubmit(formData);
//   };

//   return (
//     <form onSubmit={handleSubmit} className="space-y-6">
//       <div className="space-y-2">
//         <Label htmlFor="check_type">Check Type</Label>
//         <Select
//           required={true}
//           value={formData.check_type}
//           onValueChange={(value) => {
//             setFormData((prev) => ({
//               ...prev,
//               check_type: value,
//               attributes: {},
//             }));
//           }}
//         >
//           <SelectTrigger id="check_type">
//             <SelectValue placeholder="Select Check Type" />
//           </SelectTrigger>
//           <SelectContent>
//             {CHECK_TYPES.map((type) => (
//               <SelectItem key={type} value={type}>
//                 {type}
//               </SelectItem>
//             ))}
//           </SelectContent>
//         </Select>
//       </div>

//       {formData.check_type === "KEYWORD CHECK" && (
//         <div className="space-y-4">
//           <div className="space-y-2">
//             <Label htmlFor="keyword">Keyword</Label>
//             <Input
//               id="keyword"
//               value={formData.attributes.keyword || ""}
//               onChange={(e) => handleAttributeChange("keyword", e.target.value)}
//               required
//             />
//           </div>
//           <div className="flex items-center space-x-2">
//             <Checkbox
//               id="opposite"
//               checked={formData.attributes.opposite || false}
//               onCheckedChange={(checked) =>
//                 handleAttributeChange("opposite", checked)
//               }
//             />
//             <Label htmlFor="opposite">Opposite</Label>
//           </div>
//         </div>
//       )}

//       {formData.check_type === "PAGE DIFFERENCE" && (
//         <div className="space-y-2">
//           <Label htmlFor="percent_diff">Percent Difference</Label>
//           <Slider
//             id="percent_diff"
//             min={0}
//             max={100}
//             step={1}
//             value={[formData.attributes.percent_diff || 0]}
//             onValueChange={(value) =>
//               handleAttributeChange("percent_diff", value[0])
//             }
//           />
//           <div className="text-sm text-gray-500 mt-1">
//             {formData.attributes.percent_diff || 0}%
//           </div>
//         </div>
//       )}

//       <div className="space-y-2">
//         <Label htmlFor="url">URL</Label>
//         <Input
//           id="url"
//           type="url"
//           value={formData.url}
//           onChange={(e) => handleInputChange("url", e.target.value)}
//           required
//         />
//       </div>

//       <div className="space-y-2">
//         <Label htmlFor="alias">Alias</Label>
//         <Input
//           id="alias"
//           value={formData.alias}
//           onChange={(e) => handleInputChange("alias", e.target.value)}
//           required
//         />
//       </div>

//       <div className="space-y-2">
//         <Label htmlFor="email">Email</Label>
//         <Input
//           id="email"
//           type="email"
//           value={formData.email}
//           onChange={(e) => handleInputChange("email", e.target.value)}
//           required
//         />
//       </div>

//       <div className="space-y-2">
//         <Label htmlFor="frequency">Frequency</Label>
//         <Select
//           required
//           value={formData.delayMs.toString()}
//           onValueChange={(value) => handleInputChange("delayMs", Number(value))}
//         >
//           <SelectTrigger id="frequency">
//             <SelectValue placeholder="Select Frequency" />
//           </SelectTrigger>
//           <SelectContent>
//             {frequencyOptions.map((option) => (
//               <SelectItem key={option.value} value={option.value.toString()}>
//                 {option.label}
//               </SelectItem>
//             ))}
//           </SelectContent>
//         </Select>
//       </div>

//       {formData.delayMs >= 14400000 && (
//         <div className="space-y-2">
//           <Label htmlFor="offset">Offset (hours)</Label>
//           <Select
//             required
//             value={formData.offset?.toString() || ""}
//             onValueChange={(value) =>
//               handleInputChange("offset", Number(value))
//             }
//           >
//             <SelectTrigger id="offset">
//               <SelectValue placeholder="Select Offset" />
//             </SelectTrigger>
//             <SelectContent>
//               {Array.from({ length: formData.delayMs / 3600000 }, (_, i) => (
//                 <SelectItem key={i} value={i.toString()}>
//                   {i} hour{i !== 1 ? "s" : ""}
//                 </SelectItem>
//               ))}
//             </SelectContent>
//           </Select>
//         </div>
//       )}

//       {formData.delayMs === 604800000 && (
//         <div className="space-y-2">
//           <Label htmlFor="dayOfWeek">Day of Week</Label>
//           <Select
//             required
//             value={formData.dayOfWeek || ""}
//             onValueChange={(value) => handleInputChange("dayOfWeek", value)}
//           >
//             <SelectTrigger id="dayOfWeek">
//               <SelectValue placeholder="Select Day of Week" />
//             </SelectTrigger>
//             <SelectContent>
//               {dayOfWeekOptions.map((option) => (
//                 <SelectItem key={option.value} value={option.value}>
//                   {option.label}
//                 </SelectItem>
//               ))}
//             </SelectContent>
//           </Select>
//         </div>
//       )}

//       <Button type="submit" className="w-full">
//         Submit
//       </Button>

//       {cronDescription && (
//         <div className="mt-4 text-sm text-gray-600">
//           <p>
//             Will Run {formData.delayMs > 60 * 60 * 1000 && "In UTC Time"}{" "}
//             {cronDescription}
//           </p>
//           {/* <p>Cron Expression: {cronExpression}</p> */}
//         </div>
//       )}
//     </form>
//   );
// };

// export default ItemForm;

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

const formSchema = z
  .object({
    userid: z.string(),
    type: z.string(),
    check_type: z.string(),
    url: z.string().url().min(1).max(9999),
    alias: z.string().min(1),
    email: z.string().email().min(1).max(255),
    delayMs: z.number(),
    attributes: z.object({
      percent_diff: z.number().optional(),
      keyword: z.string().optional(),
      opposite: z.boolean().optional(),
      threshold: z.number().optional(),
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
        });
      }
    }

    if (data.check_type === "KEYWORD CHECK") {
      if (data.attributes.keyword === undefined) {
        ctx.addIssue({
          path: ["attributes", "keyword"],
          message: "Keyword is required.",
        });
      }
    }

    if (data.check_type === "PAGE DIFFERENCE") {
      if (data.attributes.percent_diff === undefined) {
        ctx.addIssue({
          path: ["attributes", "percent_diff"],
          message: "Percent_diff is required.",
        });
      }
    }

    if (data.check_type === "EBAY PRICE THRESHOLD") {
      if (data.attributes.threshold === undefined) {
        ctx.addIssue({
          path: ["attributes", "threshold"],
          message: "Threshold is required.",
        });
      }
    }
  });

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

const ItemForm = (onSubmit) => {
  const { data: session, status } = useSession();
  const [cronDescription, setCronDescription] = useState("");
  const [cronExpression, setCronExpression] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userid: "",
      type: "CHECK",
      check_type: "",
      url: "",
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

  function handleSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
    onSubmit(values);
  }

  useEffect(() => {
    if (status === "authenticated" && session?.user?.id) {
      form.setValue("userid", session.user.id);
    }
  }, [status, session]);

  useEffect(() => {
    console.log(form.getValues());
    const cronExpression = convertToCron(delayMs, offset, dayOfWeek);
    const description = cronToPlainText(cronExpression);
    setCronExpression(cronExpression);
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

  return (
    <Form {...form}>
      <form
        noValidate
        onSubmit={form.handleSubmit(handleSubmit)}
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
                    >
                      {option.label}
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
