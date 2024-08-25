"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  XIcon,
  EditIcon,
  TrashIcon,
  CheckIcon,
  XCircleIcon,
  SaveIcon,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/custom/StatusBadge";
import { CHECK_STATUS_VALUES } from "@/lib/types";
import { msToTimeStr, cronToPlainText } from "@/lib/checks/utils";
import { updateCheck } from "@/lib/api/checks";
import { RunCheckButton } from "@/components/checks/RunCheckButton";
import { useSession } from "next-auth/react";
import { z } from "zod";

interface SidebarFlyoutProps {
  isOpen: boolean;
  onClose: () => void;
  checkData: any | null;
  handleDelete: (checkData: any) => void;
  fetchDataForUser: (userid: string) => void;
}

export const SidebarFlyout = ({
  isOpen,
  onClose,
  checkData,
  handleDelete,
  fetchDataForUser,
}: SidebarFlyoutProps) => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedData, setEditedData] = useState(checkData);
  const [isUserAllowedToRunNow, setIsUserAllowedToRunNow] = useState(false);
  const { data: session, status } = useSession();
  const [currentCheckData, setCurrentCheckData] = useState(checkData);

  useEffect(() => {
    setCurrentCheckData(checkData);
  }, [checkData]);

  useEffect(() => {
    if (status === "authenticated" && session.user.id) {
      setIsUserAllowedToRunNow(session.user.userType !== "default");
    }
  }, [status, session]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const renderAttributeValue = (value) => {
    if (typeof value === "boolean") {
      return (
        <span className="flex items-center">
          {value ? (
            <CheckIcon className="h-4 w-4 text-green-500 mr-1 flex-shrink-0" />
          ) : (
            <XCircleIcon className="h-4 w-4 text-red-500 mr-1 flex-shrink-0" />
          )}
          {value ? "Yes" : "No"}
        </span>
      );
    } else if (typeof value === "number") {
      return value.toLocaleString();
    } else {
      return (
        <span className="truncate" title={value}>
          {value}
        </span>
      );
    }
  };

  const handleEdit = () => {
    setIsEditMode(true);
    setEditedData({ ...currentCheckData });
  };

  const handleSave = async () => {
    console.log("editedData", editedData);
    editedData.updatedAt = new Date().toISOString();
    try {
      const editableSchema = z.object({
        updatedAt: z.string(),
        alias: z.string().trim().min(1).max(100).optional(),
        status: z.enum(["ACTIVE", "PAUSED"]).optional(),
        email: z.string().email().trim().min(1).max(255).optional(),
        useProxy: z.boolean().optional(),
        url: z.string().url().trim().min(1).max(255),
        attributes: z.object({
          percent_diff: z.number().min(0).max(100).optional(),
          keyword: z.string().trim().max(255).optional(),
          opposite: z.boolean().optional(),
          threshold: z.number().min(0).max(1000000000).optional(),
        }),
      });

      const validationResult = editableSchema.safeParse(editedData);
      console.log("validationResult", validationResult);

      if (!validationResult.success) {
        console.error(validationResult.error);
        alert("Please check your inputs and try again.");
        return;
      }

      await updateCheck(
        {
          pk: currentCheckData.pk,
          sk: currentCheckData.sk,
          userid: currentCheckData.userid,
        },
        validationResult.data
      );

      setIsEditMode(false);
      setCurrentCheckData(editedData);

      alert("Your changes have been successfully saved.");
      fetchDataForUser(currentCheckData.userid);
    } catch (error) {
      console.error("Error saving changes:", error);
      alert("An error occurred while saving changes. Please try again.");
    }
  };

  const handleInputChange = (field, value) => {
    console.log("field", field, "value", value);

    if (field.includes(".")) {
      const [parent, child] = field.split(".");
      setEditedData((prev) => ({
        ...prev,
        [parent]: { ...prev[parent], [child]: value },
      }));
      return;
    }

    setEditedData((prev) => ({ ...prev, [field]: value }));
  };

  const handleRunNow = (pk, sk, userid) => {
    updateCheck({ pk, sk, userid }, { runNowOverride: true });
  };

  if (!isOpen) return null;

  const items = [
    {
      label: "Alias",
      value: currentCheckData?.alias || "Loading...",
      key: "alias",
      type: "text",
    },
    {
      label: "Check Type",
      value: currentCheckData?.checkType || "Loading...",
      type: "text",
    },
    {
      label: "Status",
      value: currentCheckData ? (
        <StatusBadge status={currentCheckData.status} />
      ) : (
        "Loading..."
      ),
      key: "status",
      type: "select",
      options: CHECK_STATUS_VALUES,
    },
    {
      label: "URL",
      value: currentCheckData ? (
        <a
          className="text-blue-500 hover:underline"
          href={currentCheckData.url}
        >
          {currentCheckData.url}
        </a>
      ) : (
        "Loading..."
      ),
      key: "url",
      type: "link",
    },
    {
      label: "Attributes",
      value: currentCheckData
        ? Object.entries(currentCheckData.attributes).map(([key, value]) => (
            <div key={key} className="flex justify-between items-center">
              <span className="text-sm capitalize truncate flex-shrink-0 mr-2">
                {key}:
              </span>
              <span className="font-medium truncate flex-grow">
                {currentCheckData.checkType === "EBAY PRICE THRESHOLD" && "$"}
                {renderAttributeValue(value)}
              </span>
            </div>
          ))
        : "Loading...",
      type: "attributes",
      key: "attributes",
      attributes: currentCheckData?.attributes,
    },
    {
      label: "Schedule",
      value: currentCheckData ? (
        <>
          <p>Interval: {msToTimeStr(currentCheckData.delayMs)}</p>
          <p>
            Runs{" "}
            {currentCheckData.delayMs > 60 * 60 * 1000 &&
              currentCheckData.delayMs < 7 * 24 * 60 * 60 * 1000 &&
              "Daily in UTC"}{" "}
            {cronToPlainText(currentCheckData.cron)}
          </p>
          <p className="text-gray-400 text-sm truncate">
            Cron: {currentCheckData.cron}
          </p>
        </>
      ) : (
        "Loading..."
      ),
      type: "custom",
    },
    {
      label: "Email",
      value: currentCheckData?.email || "Loading...",
      key: "email",
      type: "text",
    },
    {
      label: "Created At",
      value: currentCheckData
        ? formatDate(currentCheckData.createdAt)
        : "Loading...",
      type: "text",
    },
    {
      label: "Last Updated",
      value: currentCheckData
        ? formatDate(currentCheckData.updatedAt)
        : "Loading...",
      type: "text",
    },
    {
      label: "Use Proxy",
      value: currentCheckData
        ? renderAttributeValue(currentCheckData.useProxy)
        : renderAttributeValue(false),
      key: session.user.userType === "default" ? undefined : "useProxy",
      type: "boolean",
      options: [
        { value: true, label: "Yes" },
        { value: false, label: "No" },
      ],
    },
  ];

  return (
    <>
      <div className="z-50 fixed inset-y-0 right-0 w-96 bg-background border-l border-border shadow-lg overflow-hidden flex flex-col">
        <div className="flex justify-between items-center p-4 border-b border-border">
          <h2 className="text-xl font-semibold truncate">
            {isEditMode ? "Edit Check" : "Check Details"}
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <XIcon className="h-4 w-4" />
          </Button>
        </div>
        {currentCheckData && (
          <>
            <ScrollArea className="flex-grow">
              <div className="p-4 space-y-4 w-96">
                {items.map((item) => (
                  <div key={item.label} className="flex flex-col">
                    <h3 className="text-sm font-medium text-muted-foreground">
                      {item.label}
                    </h3>
                    {isEditMode && item.key ? (
                      item.type === "select" ? (
                        <Select
                          value={editedData[item.key]}
                          onValueChange={(value) =>
                            handleInputChange(item.key, value)
                          }
                        >
                          <SelectTrigger className="w-full mt-1">
                            <SelectValue placeholder={`Select ${item.label}`} />
                          </SelectTrigger>
                          <SelectContent>
                            {item.options.map((option) => (
                              <SelectItem key={option} value={option}>
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : item.type === "boolean" ? (
                        <Select
                          value={editedData[item.key]}
                          onValueChange={(value) =>
                            handleInputChange(item.key, value)
                          }
                        >
                          <SelectTrigger className="w-full mt-1">
                            <SelectValue placeholder={`Select ${item.label}`} />
                          </SelectTrigger>
                          <SelectContent>
                            {item.options.map((option) => (
                              <SelectItem
                                key={option.value}
                                value={option.value}
                              >
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : item.type === "attributes" ? (
                        // Custom attributes, map over them and give an input based on its type
                        item.value !== " Loading..." &&
                        Object.entries(item.attributes).map(([key, value]) => (
                          <div
                            key={key}
                            className="flex flex-col justify-between"
                          >
                            <span className="text-sm capitalize truncate flex-shrink-0 mr-2">
                              {key}
                            </span>
                            {typeof value === "boolean" ? (
                              <Select
                                value={editedData["attributes"][key]}
                                onValueChange={(value) =>
                                  handleInputChange(`attributes.${key}`, value)
                                }
                              >
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="Select" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value={true}>Yes</SelectItem>
                                  <SelectItem value={false}>No</SelectItem>
                                </SelectContent>
                              </Select>
                            ) : (
                              <Input
                                value={editedData.attributes[key]}
                                onChange={(e) =>
                                  handleInputChange(
                                    `attributes.${key}`,
                                    e.target.value
                                  )
                                }
                                className="mt-1"
                              />
                            )}
                          </div>
                        ))
                      ) : (
                        <Input
                          value={editedData[item.key]}
                          onChange={(e) =>
                            handleInputChange(item.key, e.target.value)
                          }
                          className="mt-1"
                        />
                      )
                    ) : (
                      <p className="break-words" title={item.value}>
                        {item.value}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
            <div className="p-4 border-t border-border space-y-2">
              {isEditMode ? (
                <Button
                  className="w-full"
                  variant="default"
                  onClick={handleSave}
                >
                  <SaveIcon className="mr-2 h-4 w-4" /> Save Changes
                </Button>
              ) : (
                <RunCheckButton
                  checkData={currentCheckData}
                  handleRunNow={handleRunNow}
                  isUserAllowed={isUserAllowedToRunNow}
                />
              )}
              <div className="flex space-x-2">
                {isEditMode ? (
                  <Button
                    className="flex-1"
                    variant="outline"
                    onClick={() => setIsEditMode(false)}
                  >
                    Cancel
                  </Button>
                ) : (
                  <Button
                    className="flex-1"
                    variant="outline"
                    onClick={handleEdit}
                  >
                    <EditIcon className="mr-2 h-4 w-4" /> Edit
                  </Button>
                )}
                <Button
                  className="flex-1"
                  variant="destructive"
                  onClick={() =>
                    handleDelete([
                      {
                        pk: currentCheckData.pk,
                        sk: currentCheckData.sk,
                        userid: session.user.id,
                      },
                    ])
                  }
                >
                  <TrashIcon className="mr-2 h-4 w-4" /> Delete
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
};
