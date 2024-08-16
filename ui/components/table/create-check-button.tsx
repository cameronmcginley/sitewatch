import React from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MutatingDots } from "react-loader-spinner";
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
      open={isCreateItemModalOpen || isCreateItemLoading}
      onOpenChange={setIsCreateItemModalOpen}
    >
      <DialogTrigger asChild>
        <Button className={`${isMobile ? "w-full" : ""}`}>Create Check</Button>
      </DialogTrigger>
      <DialogContent className="max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isCreateItemLoading ? "Creating Item..." : "Create New Check"}
          </DialogTitle>
        </DialogHeader>
        {isCreateItemLoading ? (
          <div className="flex flex-col justify-center items-center">
            <MutatingDots
              height={100}
              width={100}
              color="#000"
              secondaryColor="#000"
              radius={12.5}
              ariaLabel="mutating-dots-loading"
            />
          </div>
        ) : (
          <ItemForm handleCreateItemSubmit={handleCreateItemSubmit} />
        )}
      </DialogContent>
    </Dialog>
  );
};
