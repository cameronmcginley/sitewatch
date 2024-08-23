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
import { StatusBadge } from "./status-badge";
import { CHECK_STATUS_VALUES } from "@/lib/types";
import { convertMsToTime, cronToPlainText } from "./table/utils";
import { updateItem } from "@/lib/api/items";
import { RunCheckButton } from "./run-check-button";
import { useSession } from "next-auth/react";
import { createItemFormSchema } from "./items/schema";
import { z } from "zod";
import { check } from "drizzle-orm/mysql-core";
import { set } from "date-fns";

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
    if (status === "authenticated" && session?.user?.id) {
      setIsUserAllowedToRunNow(session?.user?.userType !== "default");
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
      // Define the editable fields schema
      const editableSchema = z.object({
        updatedAt: z.string(),
        alias: z.string().trim().min(1).max(100).optional(),
        status: z.enum(["ACTIVE", "PAUSED"]).optional(),
        email: z.string().email().trim().min(1).max(255).optional(),
        // useProxy: z.boolean().optional(),
      });

      // Validate the editable fields
      const validationResult = editableSchema.safeParse(editedData);
      console.log("validationResult", validationResult);

      if (!validationResult.success) {
        console.error(validationResult.error);
        // toast({
        //   title: "Validation Error",
        //   description: "Please check your inputs and try again.",
        //   variant: "destructive",
        // });
        alert("Please check your inputs and try again.");
        return;
      }

      // If validation passes, update the item
      await updateItem(
        {
          pk: currentCheckData.pk,
          sk: currentCheckData.sk,
          userid: currentCheckData.userid,
        },
        validationResult.data
      );

      // Update the local state
      // setCheckData((prevData) => ({ ...prevData, ...validationResult.data }));

      // Exit edit mode
      setIsEditMode(false);
      // checkData = editedData;
      setCurrentCheckData(editedData);

      // toast({
      //   title: "Changes Saved",
      //   description: "Your changes have been successfully saved.",
      // });
      alert("Your changes have been successfully saved.");

      // Refresh the data
      fetchDataForUser(currentCheckData.userid);
    } catch (error) {
      console.error("Error saving changes:", error);
      // toast({
      //   title: "Error",
      //   description:
      //     "An error occurred while saving changes. Please try again.",
      //   variant: "destructive",
      // });
      alert("An error occurred while saving changes. Please try again.");
    }
  };

  const handleInputChange = (field, value) => {
    setEditedData((prev) => ({ ...prev, [field]: value }));
  };

  const handleRunNow = (pk, sk, userid) => {
    updateItem({ pk, sk, userid }, { runNowOverride: true });
  };

  if (!isOpen) return null;

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
                {[
                  {
                    label: "Alias",
                    value: currentCheckData.alias,
                    key: "alias",
                  },
                  { label: "Check Type", value: currentCheckData.check_type },
                  {
                    label: "Status",
                    value: <StatusBadge status={currentCheckData.status} />,
                    key: "status",
                  },
                ].map((item) => (
                  <div key={item.label} className="flex flex-col">
                    <h3 className="text-sm font-medium text-muted-foreground">
                      {item.label}
                    </h3>
                    {isEditMode && item.key ? (
                      item.key === "status" ? (
                        <Select
                          value={editedData[item.key]}
                          onValueChange={(value) =>
                            handleInputChange(item.key, value)
                          }
                        >
                          <SelectTrigger className="w-full mt-1">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            {CHECK_STATUS_VALUES.map((status) => (
                              <SelectItem key={status} value={status}>
                                {status}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
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
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">
                    URL
                  </h3>
                  <p className="break-words" title={currentCheckData.url}>
                    <a
                      className="text-blue-500 hover:underline"
                      href={currentCheckData.url}
                    >
                      {currentCheckData.url}
                    </a>
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Attributes
                  </h3>
                  <div className="space-y-2 mt-1">
                    {Object.entries(currentCheckData.attributes).map(
                      ([key, value]) => (
                        <div
                          key={key}
                          className="flex justify-between items-center"
                        >
                          <span
                            className="text-sm capitalize truncate flex-shrink-0 mr-2"
                            title={key}
                          >
                            {key}:
                          </span>
                          <span className="font-medium truncate flex-grow">
                            {currentCheckData.check_type ===
                              "EBAY PRICE THRESHOLD" && "$"}
                            {renderAttributeValue(value)}
                          </span>
                        </div>
                      )
                    )}
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Schedule
                  </h3>
                  <p
                    className="truncate"
                    title={`Interval: ${convertMsToTime(
                      currentCheckData.delayMs
                    )}`}
                  >
                    Interval: {convertMsToTime(currentCheckData.delayMs)}
                  </p>
                  <p
                    className=""
                    title={`Runs ${
                      currentCheckData.delayMs > 60 * 60 * 1000 &&
                      currentCheckData.delayMs < 7 * 24 * 60 * 60 * 1000
                        ? "Daily in UTC"
                        : ""
                    } ${cronToPlainText(currentCheckData.cron)}`}
                  >
                    Runs{" "}
                    {currentCheckData.delayMs > 60 * 60 * 1000 &&
                      currentCheckData.delayMs < 7 * 24 * 60 * 60 * 1000 &&
                      "Daily in UTC"}{" "}
                    {cronToPlainText(currentCheckData.cron)}
                  </p>
                  <p
                    className="text-gray-400 text-sm truncate"
                    title={`Cron: ${currentCheckData.cron}`}
                  >
                    Cron: {currentCheckData.cron}
                  </p>
                </div>
                {[
                  {
                    label: "Email",
                    value: currentCheckData.email,
                    key: "email",
                  },
                  {
                    label: "Created At",
                    value: formatDate(currentCheckData.createdAt),
                  },
                  {
                    label: "Last Updated",
                    value: formatDate(currentCheckData.updatedAt),
                  },
                  {
                    label: "Use Proxy",
                    value: renderAttributeValue(currentCheckData.useProxy),
                  },
                ].map((item) => (
                  <div key={item.label} className="flex flex-col">
                    <h3 className="text-sm font-medium text-muted-foreground">
                      {item.label}
                    </h3>
                    {isEditMode && item.key ? (
                      <Input
                        value={editedData[item.key]}
                        onChange={(e) =>
                          handleInputChange(item.key, e.target.value)
                        }
                        className="mt-1"
                      />
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
                        userid: session?.user?.id,
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
