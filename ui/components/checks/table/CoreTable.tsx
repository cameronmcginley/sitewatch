import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  formatCells,
  getGenericColumns,
  getTypeSpecificColumns,
} from "./cell-formatters";
import { CheckItem, CheckType } from "@/lib/types";
import { CustomPagination } from "./CustomPagination";
import { CreateCheckButton } from "./CreateCheckButton";
import { useMediaQuery } from "@/hooks/use-media-query";
import { SidebarFlyout } from "@/components/checks/SidebarFlyout";

const CoreTable = ({
  data,
  handleDelete,
  isLoading,
  handleCreateItemSubmit,
  isCreateItemModalOpen,
  setIsCreateItemModalOpen,
  fetchDataForUser,
  selectedItems,
  setSelectedItems,
}) => {
  const [selectedCheckType, setSelectedCheckType] = useState<CheckType | "ALL">(
    "ALL"
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [isSidebarFlyoutOpen, setIsSidebarFlyoutOpen] = useState(false);
  const [flyoutItem, setFlyoutItem] = useState<CheckItem | null>(null);
  const itemsPerPage = 10;

  const usedCheckTypes = ["ALL"].concat(
    Array.from(new Set(data.map((item) => item.checkType)))
  );

  const columns =
    selectedCheckType === "ALL"
      ? getGenericColumns()
      : getTypeSpecificColumns(selectedCheckType);

  const filteredData =
    selectedCheckType === "ALL"
      ? data
      : data.filter((item: CheckItem) => item.checkType === selectedCheckType);

  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleOpenSidebarFlyout = (item: any) => {
    setIsSidebarFlyoutOpen(true);
    setFlyoutItem(item);
  };

  const handleCloseSidebarFlyout = () => {
    setIsSidebarFlyoutOpen(false);
    setFlyoutItem(null);
  };

  const handleSelectItem = (item: CheckItem) => {
    setSelectedItems((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const isMobile = useMediaQuery("(max-width: 640px)");

  return (
    <div className="relative">
      <div
        className={`flex gap-4 mb-4 ${
          isMobile ? "flex-col sm:justify-between" : "flex-row justify-between"
        }`}
      >
        {/* Left side */}
        <div
          className={`flex flex-col gap-2 ${
            isMobile ? "w-full" : "items-center"
          }`}
        >
          <p className="font-medium text-sm sm:text-base">
            Filter by Check Type
          </p>
          <Select
            onValueChange={(value: string) =>
              setSelectedCheckType(value as CheckType | "ALL")
            }
            defaultValue="ALL"
          >
            <SelectTrigger className={`${isMobile ? "w-full" : "w-[180px]"}`}>
              <SelectValue placeholder="Filter by Check Type" />
            </SelectTrigger>
            <SelectContent>
              {usedCheckTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  <p className="font-medium">{type}</p>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Right side */}
        <div
          className={`flex gap-2 items-end ${
            isMobile ? "flex-col w-full" : "flex-row"
          }`}
        >
          {selectedItems.length > 0 && (
            <Button
              onClick={() => handleDelete(selectedItems)}
              className="bg-red-700 hover:bg-red-600 w-full sm:w-auto"
            >
              Delete {selectedItems.length} items
            </Button>
          )}
          <CreateCheckButton
            isCreateItemModalOpen={isCreateItemModalOpen}
            setIsCreateItemModalOpen={setIsCreateItemModalOpen}
            handleCreateItemSubmit={handleCreateItemSubmit}
            isMobile={isMobile}
          />
        </div>
      </div>

      <div className={`relative`}>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">
                <Checkbox
                  checked={
                    selectedItems.length === filteredData.length && !isLoading
                  }
                  onCheckedChange={(checked) =>
                    setSelectedItems(checked ? filteredData : [])
                  }
                />
              </TableHead>
              {columns.map((column, index: number) => (
                <TableHead key={index}>{column.header}</TableHead>
              ))}
              <TableHead className="w-[100px]"></TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {isLoading
              ? Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Skeleton className="h-4 w-4" />
                    </TableCell>
                    {columns.map((_, colIndex) => (
                      <TableCell key={colIndex}>
                        <Skeleton className="h-4 w-full" />
                      </TableCell>
                    ))}
                    <TableCell>
                      <Skeleton className="h-4 w-[100px]" />
                    </TableCell>
                  </TableRow>
                ))
              : paginatedData.map((item: CheckItem, index: number) => (
                  <TableRow key={item.pk ?? item.sk ?? index}>
                    <TableCell>
                      <Checkbox
                        checked={selectedItems.includes(item)}
                        onCheckedChange={() => handleSelectItem(item)}
                      />
                    </TableCell>

                    {formatCells(item, columns)}

                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenSidebarFlyout(item)}
                      >
                        Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
          </TableBody>
        </Table>
        {data.length > 0 && (
          <div className="mt-4">
            <CustomPagination
              currentPage={currentPage}
              totalPages={Math.ceil(filteredData.length / itemsPerPage)}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>

      <SidebarFlyout
        isOpen={isSidebarFlyoutOpen}
        onClose={handleCloseSidebarFlyout}
        checkData={flyoutItem}
        handleDelete={handleDelete}
        fetchDataForUser={fetchDataForUser}
      />
    </div>
  );
};

export default CoreTable;
