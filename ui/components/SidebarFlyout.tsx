"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  XIcon,
  EditIcon,
  TrashIcon,
  PlayIcon,
  CheckIcon,
  XCircleIcon,
} from "lucide-react";

interface SidebarFlyoutProps {
  isOpen: boolean;
  onClose: () => void;
  checkData: any | null;
}

export const SidebarFlyout = ({
  isOpen,
  onClose,
  checkData,
}: SidebarFlyoutProps) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const renderAttributeValue = (value) => {
    if (typeof value === "boolean") {
      return (
        <span className="flex items-center">
          {value ? (
            <CheckIcon className="h-4 w-4 text-green-500 mr-1" />
          ) : (
            <XCircleIcon className="h-4 w-4 text-red-500 mr-1" />
          )}
          {value ? "Yes" : "No"}
        </span>
      );
    } else if (typeof value === "number") {
      return value.toLocaleString();
    } else {
      return value;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="z-50 fixed inset-y-0 right-0 w-96 bg-background border-l border-border shadow-lg transition-transform transform translate-x-0 overflow-hidden">
      <div className="h-full flex flex-col">
        <div className="flex justify-between items-center p-4 border-b border-border">
          <h2 className="text-xl font-semibold">Check Details</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <XIcon className="h-4 w-4" />
          </Button>
        </div>
        <ScrollArea className="flex-grow">
          <div className="p-4 space-y-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">
                Alias
              </h3>
              <p className="text-lg font-semibold">{checkData.alias}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">
                Check Type
              </h3>
              <p>{checkData.check_type}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">
                Status
              </h3>
              <Badge
                variant={
                  checkData.status === "ACTIVE" ? "success" : "destructive"
                }
              >
                {checkData.status}
              </Badge>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">URL</h3>
              <p className="text-sm break-all">{checkData.url}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">
                Attributes
              </h3>
              <div className="space-y-2 mt-1">
                {Object.entries(checkData.attributes).map(([key, value]) => (
                  <div key={key} className="flex justify-between items-center">
                    <span className="text-sm capitalize">{key}:</span>
                    <span className="font-medium">
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
              <p>{checkData.cron}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">
                Email
              </h3>
              <p>{checkData.email}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">
                Created At
              </h3>
              <p>{formatDate(checkData.createdAt)}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">
                Last Updated
              </h3>
              <p>{formatDate(checkData.updatedAt)}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">
                Use Proxy
              </h3>
              <p>{renderAttributeValue(checkData.useProxy)}</p>
            </div>
          </div>
        </ScrollArea>
        <div className="p-4 border-t border-border space-y-2">
          <Button className="w-full" variant="default">
            <PlayIcon className="mr-2 h-4 w-4" /> Run Check Now
          </Button>
          <div className="flex space-x-2">
            <Button className="flex-1" variant="outline">
              <EditIcon className="mr-2 h-4 w-4" /> Edit
            </Button>
            <Button className="flex-1" variant="destructive">
              <TrashIcon className="mr-2 h-4 w-4" /> Delete
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
