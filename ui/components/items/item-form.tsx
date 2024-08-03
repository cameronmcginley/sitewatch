import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { CHECK_TYPES } from "@/lib/constants";
import cronstrue from "cronstrue";
import {
  convertToCron,
  cronToPlainText,
  convertDelayToCron,
} from "../table/utils";

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

const FormField = ({ label, id, ...props }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-gray-700">
      {label}
    </label>
    <input
      id={id}
      {...props}
      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
    />
  </div>
);

const SelectField = ({ label, id, options, ...props }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-gray-700">
      {label}
    </label>
    <select
      id={id}
      {...props}
      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
    >
      <option value="">Select {label}</option>
      {options.map(
        (option: string | { label: string; value: number | string }) => (
          <option
            key={typeof option === "string" ? option : option.value}
            value={typeof option === "string" ? option : option.value}
          >
            {typeof option === "string" ? option : option.label}
          </option>
        )
      )}
    </select>
  </div>
);

const CheckboxField = ({ label, id, ...props }) => (
  <div className="flex items-center">
    <input
      type="checkbox"
      id={id}
      {...props}
      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
    />
    <label htmlFor={id} className="ml-2 block text-sm text-gray-900">
      {label}
    </label>
  </div>
);

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
  const [hourOffsetOptions, sethourOffsetOptions] = useState([]);
  const [dayOfWeekOptions, setdayOfWeekOptions] = useState([
    { label: "Sunday", value: "0" },
    { label: "Monday", value: "1" },
    { label: "Tuesday", value: "2" },
    { label: "Wednesday", value: "3" },
    { label: "Thursday", value: "4" },
    { label: "Friday", value: "5" },
    { label: "Saturday", value: "6" },
  ]);
  const [cronDescription, setCronDescription] = useState("");
  const [cronExpression, setCronExpression] = useState<string | null>(null);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    isAttribute: boolean = false
  ) => {
    let { name, value } = e.target as { name: string; value: any };

    if (name === "frequency") {
      name = "delayMs";
      value = Number(value);
    }

    if (isAttribute) {
      setFormData((prev) => ({
        ...prev,
        attributes: { ...prev.attributes, [name]: value },
      }));
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    if (status === "authenticated" && session?.user?.id) {
      setFormData((prev) => ({ ...prev, userid: session.user.id }));
    }
  }, [status, session]);

  useEffect(() => {
    if (formData.delayMs >= 14400000) {
      const interval = formData.delayMs / 3600000;
      const options = Array.from({ length: interval }, (_, i) => ({
        label: `${i} hour${i !== 1 ? "s" : ""}`,
        value: i,
      }));
      sethourOffsetOptions(options);
    }

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

  const handleCheckboxChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    isAttribute: boolean = false
  ) => {
    const { name, checked } = e.target;

    if (isAttribute) {
      setFormData((prev) => ({
        ...prev,
        attributes: { ...prev.attributes, [name]: checked },
      }));
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const getCurrentFrequency = () => {
    const delayMs = parseInt(formData.delayMs);
    return frequencyOptions
      .reduce((prev, curr) =>
        Math.abs(curr.value - delayMs) < Math.abs(prev.value - delayMs)
          ? curr
          : prev
      )
      .value.toString();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-black">
      <SelectField
        label="Check Type"
        id="check_type"
        name="check_type"
        value={formData.check_type}
        onChange={(
          e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
        ) => {
          setFormData((prev) => ({ ...prev, attributes: {} }));
          handleInputChange(e);
        }}
        options={CHECK_TYPES}
        required
      />

      {formData.check_type === "KEYWORD CHECK" && (
        <>
          <FormField
            label="Keyword"
            id="keyword"
            name="keyword"
            type="text"
            value={formData.keyword}
            onChange={(
              e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
            ) => handleInputChange(e, true)}
            required
          />

          <CheckboxField
            label="Opposite"
            id="opposite"
            name="opposite"
            checked={formData.opposite}
            onChange={(
              e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
            ) => handleCheckboxChange(e, true)}
            required
          />
        </>
      )}

      {formData.check_type === "PAGE DIFFERENCE" && (
        <FormField
          label="Percent Difference"
          id="percent_diff"
          name="percent_diff"
          type="number"
          value={formData.attributes.percent_diff || ""}
          onChange={(
            e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
          ) => handleInputChange(e, true)}
          step="1"
          min="0"
          max="100"
          required
        />
      )}

      <FormField
        label="URL"
        id="url"
        name="url"
        type="url"
        value={formData.url}
        onChange={handleInputChange}
        required
      />

      <FormField
        label="Alias"
        id="alias"
        name="alias"
        type="text"
        value={formData.alias}
        onChange={handleInputChange}
        required
      />

      <FormField
        label="Email"
        id="email"
        name="email"
        type="email"
        value={formData.email}
        onChange={handleInputChange}
        required
      />

      <SelectField
        label="Frequency"
        id="frequency"
        name="frequency"
        value={getCurrentFrequency()}
        onChange={handleInputChange}
        options={frequencyOptions}
        required
      />

      {formData.delayMs >= 14400000 && (
        <SelectField
          label="Offset"
          id="offset"
          name="offset"
          value={formData.offset || ""}
          onChange={handleInputChange}
          options={hourOffsetOptions}
          required
        />
      )}

      {formData.delayMs === 604800000 && (
        <SelectField
          label="Day of Week"
          id="dayOfWeek"
          name="dayOfWeek"
          value={formData.dayOfWeek || ""}
          onChange={handleInputChange}
          options={dayOfWeekOptions}
          required
        />
      )}

      <div>
        <button
          type="submit"
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Submit
        </button>
      </div>

      {cronDescription && (
        <div className="mt-4 text-gray-700">
          <p>Cron Schedule: {cronDescription}</p>
          <p>Cron Expression: {cronExpression}</p>
        </div>
      )}
    </form>
  );
};

export default ItemForm;
