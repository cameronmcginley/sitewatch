import React, { useState } from "react";
import { useSession } from "next-auth/react";
import { CHECK_TYPES } from "@/lib/constants";

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

// Make in constants also
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
}

// Reusable form components
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
      {options.map((option: string | { label: string; value: number }) => (
        <option
          key={typeof option === "string" ? option : option.value}
          value={typeof option === "string" ? option : option.value}
        >
          {typeof option === "string" ? option : option.label}
        </option>
      ))}
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
  const { data: session } = useSession();
  const [formData, setFormData] = useState<FormData>({
    userid: session?.user?.id || "",
    type: "CHECK",
    check_type: "",
    url: "",
    alias: "",
    email: "",
    delayMs: 4 * 60 * 60 * 1000,
    attributes: {},
  });

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

  React.useEffect(() => {
    console.log(formData);
  }, [formData]);

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
          // Reset attributes when changing check type
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

      <div>
        <button
          type="submit"
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Submit
        </button>
      </div>
    </form>
  );
};

export default ItemForm;
