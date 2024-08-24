import React from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import CreateCheckForm from "@/components/checks/CreateCheckForm";

interface CreateCheckButtonProps {
  isCreateItemModalOpen: boolean;
  setIsCreateItemModalOpen: (open: boolean) => void;
  handleCreateItemSubmit: () => void;
  isMobile: boolean;
}

export const CreateCheckButton: React.FC<CreateCheckButtonProps> = ({
  isCreateItemModalOpen,
  setIsCreateItemModalOpen,
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
          <DialogTitle>{"Create New Check"}</DialogTitle>
        </DialogHeader>
        <div className="relative">
          <CreateCheckForm handleCreateItemSubmit={handleCreateItemSubmit} />
        </div>
      </DialogContent>
    </Dialog>
  );
};
