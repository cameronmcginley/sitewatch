import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { Database } from "lucide-react";
import { CreateCheckButton } from "./CreateCheckButton";

export const NoChecksFound = ({
  isCreateItemModalOpen,
  setIsCreateItemModalOpen,
  handleCreateItemSubmit,
}) => {
  return (
    <div className="flex flex-col items-center justify-center bg-background m-24 p-6 space-y-5">
      <Database
        className="w-16 h-16 text-muted-foreground"
        aria-hidden="true"
      />
      <h3 className="text-2xl font-semibold text-muted-foreground">
        No check configurations found
      </h3>
      <p className="text-muted-foreground">
        Get started by creating your first configuration.
      </p>
      <CreateCheckButton
        isCreateItemModalOpen={isCreateItemModalOpen}
        setIsCreateItemModalOpen={setIsCreateItemModalOpen}
        handleCreateItemSubmit={handleCreateItemSubmit}
        isMobile={false}
      />
    </div>
  );
};
