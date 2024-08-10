import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { CHECK_TYPES } from "@/lib/constants";
import { convertToCron, cronToPlainText } from "../table/utils";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

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

interface FormData {
  userid: string;
  type: string;
  check_type: string;
  url: string;
  alias: string;
  email: string;
  delayMs: number;
  attributes: {
    percent_diff?: number;
    keyword?: string;
    opposite?: boolean;
  };
  offset?: number;
  dayOfWeek?: string;
  cron: string;
  lastResult: null;
  mostRecentAlert: null;
  status: string;
}

const ItemForm: React.FC<{ onSubmit: (data: FormData) => void }> = ({
  onSubmit,
}) => {
  const { data: session, status } = useSession();
  const [formData, setFormData] = useState<FormData>({
    userid: "",
    type: "CHECK",
    check_type: "",
    url: "",
    alias: "",
    email: "",
    delayMs: 4 * 60 * 60 * 1000,
    attributes: {},
    cron: "",
    lastResult: null,
    mostRecentAlert: null,
    status: "ACTIVE",
  });
  const [cronDescription, setCronDescription] = useState("");
  const [cronExpression, setCronExpression] = useState<string | null>(null);

  useEffect(() => {
    if (status === "authenticated" && session?.user?.id) {
      setFormData((prev) => ({ ...prev, userid: session.user.id }));
    }
  }, [status, session]);

  useEffect(() => {
    const cronExpression = convertToCron(
      formData.delayMs,
      formData.offset,
      formData.dayOfWeek
    );
    const description = cronToPlainText(cronExpression);
    setCronExpression(cronExpression);
    setCronDescription(description);
    setFormData((prev) => ({ ...prev, cron: cronExpression }));
  }, [formData.delayMs, formData.offset, formData.dayOfWeek]);

  const handleInputChange = (name: string, value: any) => {
    console.log(formData);
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAttributeChange = (name: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      attributes: { ...prev.attributes, [name]: value },
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="check_type">Check Type</Label>
        <Select
          required={true}
          value={formData.check_type}
          onValueChange={(value) => {
            setFormData((prev) => ({
              ...prev,
              check_type: value,
              attributes: {},
            }));
          }}
        >
          <SelectTrigger id="check_type">
            <SelectValue placeholder="Select Check Type" />
          </SelectTrigger>
          <SelectContent>
            {CHECK_TYPES.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {formData.check_type === "KEYWORD CHECK" && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="keyword">Keyword</Label>
            <Input
              id="keyword"
              value={formData.attributes.keyword || ""}
              onChange={(e) => handleAttributeChange("keyword", e.target.value)}
              required
            />
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="opposite"
              checked={formData.attributes.opposite || false}
              onCheckedChange={(checked) =>
                handleAttributeChange("opposite", checked)
              }
            />
            <Label htmlFor="opposite">Opposite</Label>
          </div>
        </div>
      )}

      {formData.check_type === "PAGE DIFFERENCE" && (
        <div className="space-y-2">
          <Label htmlFor="percent_diff">Percent Difference</Label>
          <Slider
            id="percent_diff"
            min={0}
            max={100}
            step={1}
            value={[formData.attributes.percent_diff || 0]}
            onValueChange={(value) =>
              handleAttributeChange("percent_diff", value[0])
            }
          />
          <div className="text-sm text-gray-500 mt-1">
            {formData.attributes.percent_diff || 0}%
          </div>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="url">URL</Label>
        <Input
          id="url"
          type="url"
          value={formData.url}
          onChange={(e) => handleInputChange("url", e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="alias">Alias</Label>
        <Input
          id="alias"
          value={formData.alias}
          onChange={(e) => handleInputChange("alias", e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => handleInputChange("email", e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="frequency">Frequency</Label>
        <Select
          required
          value={formData.delayMs.toString()}
          onValueChange={(value) => handleInputChange("delayMs", Number(value))}
        >
          <SelectTrigger id="frequency">
            <SelectValue placeholder="Select Frequency" />
          </SelectTrigger>
          <SelectContent>
            {frequencyOptions.map((option) => (
              <SelectItem key={option.value} value={option.value.toString()}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {formData.delayMs >= 14400000 && (
        <div className="space-y-2">
          <Label htmlFor="offset">Offset (hours)</Label>
          <Select
            required
            value={formData.offset?.toString() || ""}
            onValueChange={(value) =>
              handleInputChange("offset", Number(value))
            }
          >
            <SelectTrigger id="offset">
              <SelectValue placeholder="Select Offset" />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: formData.delayMs / 3600000 }, (_, i) => (
                <SelectItem key={i} value={i.toString()}>
                  {i} hour{i !== 1 ? "s" : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {formData.delayMs === 604800000 && (
        <div className="space-y-2">
          <Label htmlFor="dayOfWeek">Day of Week</Label>
          <Select
            required
            value={formData.dayOfWeek || ""}
            onValueChange={(value) => handleInputChange("dayOfWeek", value)}
          >
            <SelectTrigger id="dayOfWeek">
              <SelectValue placeholder="Select Day of Week" />
            </SelectTrigger>
            <SelectContent>
              {dayOfWeekOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <Button type="submit" className="w-full">
        Submit
      </Button>

      {cronDescription && (
        <div className="mt-4 text-sm text-gray-600">
          <p>
            Will Run {formData.delayMs > 60 * 60 * 1000 && "In UTC Time"}{" "}
            {cronDescription}
          </p>
          {/* <p>Cron Expression: {cronExpression}</p> */}
        </div>
      )}
    </form>
  );
};

export default ItemForm;
