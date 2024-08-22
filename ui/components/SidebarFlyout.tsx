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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface SidebarFlyoutProps {
  isOpen: boolean;
  onClose: () => void;
  checkData: any | null;
  handleDelete: (checkData: any) => void;
}

export const SidebarFlyout = ({
  isOpen,
  onClose,
  checkData,
  handleDelete,
}: SidebarFlyoutProps) => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedData, setEditedData] = useState(checkData);
  const [isUserAllowedToRunNow, setIsUserAllowedToRunNow] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const { data: session, status } = useSession();

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
    setEditedData({ ...checkData });
  };

  const handleSave = () => {
    // Implement save logic here
    setIsEditMode(false);
    // Update checkData with editedData
  };

  const handleInputChange = (field, value) => {
    setEditedData((prev) => ({ ...prev, [field]: value }));
  };

  const handleRunNow = (pk, sk, userid) => {
    updateItem({ pk, sk, userid }, { runNowOverride: true });
  };

  const deleteCheckItems = (pk, sk) => {
    handleDelete([{ pk, sk }]);
    setIsDeleteModalOpen(false);
    onClose();
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
        <ScrollArea className="flex-grow">
          <div className="p-4 space-y-4 w-96">
            {[
              { label: "Alias", value: checkData.alias, key: "alias" },
              { label: "Check Type", value: checkData.check_type },
              {
                label: "Status",
                value: <StatusBadge status={checkData.status} />,
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
              <h3 className="text-sm font-medium text-muted-foreground">URL</h3>
              <p className="break-words" title={checkData.url}>
                <a
                  className="text-blue-500 hover:underline"
                  href={checkData.url}
                >
                  {checkData.url}
                </a>
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">
                Attributes
              </h3>
              <div className="space-y-2 mt-1">
                {Object.entries(checkData.attributes).map(([key, value]) => (
                  <div key={key} className="flex justify-between items-center">
                    <span
                      className="text-sm capitalize truncate flex-shrink-0 mr-2"
                      title={key}
                    >
                      {key}:
                    </span>
                    <span className="font-medium truncate flex-grow">
                      {checkData.check_type === "EBAY PRICE THRESHOLD" && "$"}
                      {renderAttributeValue(value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">
                Schedule
              </h3>
              <p
                className="truncate"
                title={`Interval: ${convertMsToTime(checkData.delayMs)}`}
              >
                Interval: {convertMsToTime(checkData.delayMs)}
              </p>
              <p
                className=""
                title={`Runs ${
                  checkData.delayMs > 60 * 60 * 1000 &&
                  checkData.delayMs < 7 * 24 * 60 * 60 * 1000
                    ? "Daily in UTC"
                    : ""
                } ${cronToPlainText(checkData.cron)}`}
              >
                Runs{" "}
                {checkData.delayMs > 60 * 60 * 1000 &&
                  checkData.delayMs < 7 * 24 * 60 * 60 * 1000 &&
                  "Daily in UTC"}{" "}
                {cronToPlainText(checkData.cron)}
              </p>
              <p
                className="text-gray-400 text-sm truncate"
                title={`Cron: ${checkData.cron}`}
              >
                Cron: {checkData.cron}
              </p>
            </div>
            {[
              { label: "Email", value: checkData.email, key: "email" },
              { label: "Created At", value: formatDate(checkData.createdAt) },
              { label: "Last Updated", value: formatDate(checkData.updatedAt) },
              {
                label: "Use Proxy",
                value: renderAttributeValue(checkData.useProxy),
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
            <Button className="w-full" variant="default" onClick={handleSave}>
              <SaveIcon className="mr-2 h-4 w-4" /> Save Changes
            </Button>
          ) : (
            <RunCheckButton
              checkData={checkData}
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
              <Button className="flex-1" variant="outline" onClick={handleEdit}>
                <EditIcon className="mr-2 h-4 w-4" /> Edit
              </Button>
            )}
            <Button
              className="flex-1"
              variant="destructive"
              onClick={() => setIsDeleteModalOpen(true)}
            >
              <TrashIcon className="mr-2 h-4 w-4" /> Delete
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Are you sure you want to delete this check?
            </DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the
              check and remove all associated data.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteCheckItems(checkData.pk, checkData.sk)}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
