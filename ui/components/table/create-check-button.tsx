import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import ItemForm from "@/components/items/item-form";

interface CreateCheckButtonProps {
  isCreateItemModalOpen: boolean;
  setIsCreateItemModalOpen: (open: boolean) => void;
  isCreateItemLoading: boolean;
  handleCreateItemSubmit: () => void;
  isMobile: boolean;
}

export const CreateCheckButton: React.FC<CreateCheckButtonProps> = ({
  isCreateItemModalOpen,
  setIsCreateItemModalOpen,
  isCreateItemLoading,
  handleCreateItemSubmit,
  isMobile,
}) => {
  return (
    <Dialog
      open={isCreateItemModalOpen}
      onOpenChange={setIsCreateItemModalOpen}
    >
      <DialogTrigger asChild>
        <Button className={isMobile ? "w-full" : ""}>Create Check</Button>
      </DialogTrigger>
      <DialogContent className="max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isCreateItemLoading ? "Creating Check" : "Create New Check"}
          </DialogTitle>
        </DialogHeader>
        <div className="relative">
          {/* <div className={isCreateItemLoading ? "opacity-50" : ""}> */}
          <ItemForm handleCreateItemSubmit={handleCreateItemSubmit} />
          {/* </div> */}
        </div>
      </DialogContent>
    </Dialog>
  );
};
