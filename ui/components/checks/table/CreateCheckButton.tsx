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
import { PlusCircle } from "lucide-react";

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
        <Button className={isMobile ? "w-full" : ""}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Create Check
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[80vh] max-w-[95%] w-[320px] sm:w-[480px] md:w-[640px] lg:w-[800px] xl:w-[960px] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center font-bold text-2xl">
            Create New Check
          </DialogTitle>
        </DialogHeader>
        <div className="relative">
          <CreateCheckForm handleCreateItemSubmit={handleCreateItemSubmit} />
        </div>
      </DialogContent>
    </Dialog>
  );
};
