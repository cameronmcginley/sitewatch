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
import { handleShowDetails } from "./utils";
import { CheckItem } from "@/lib/types";
import { CustomPagination } from "./custom-pagination";
import DeleteOverlay from "./delete-overlay";
import { CreateCheckButton } from "./create-check-button";
import { useMediaQuery } from "@/hooks/use-media-query";

const CoreTable = ({
  data,
  handleDelete,
  isLoading,
  handleCreateItemSubmit,
  isCreateItemLoading,
  isCreateItemModalOpen,
  setIsCreateItemModalOpen,
}) => {
  const [selectedCheckType, setSelectedCheckType] = useState("ALL");
  const [selectedItems, setSelectedItems] = useState<CheckItem[]>([]);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const checkTypes = ["ALL", ...new Set(data.map((item) => item.check_type))];

  const columns =
    selectedCheckType === "ALL"
      ? getGenericColumns()
      : getTypeSpecificColumns(selectedCheckType);

  const filteredData =
    selectedCheckType === "ALL"
      ? data
      : data.filter((item: CheckItem) => item.check_type === selectedCheckType);

  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSelectItem = (item: CheckItem) => {
    setSelectedItems((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const handleDeleteItems = async () => {
    try {
      setIsDeleteLoading(true);
      await handleDelete(selectedItems);
    } finally {
      setIsDeleteLoading(false);
      setSelectedItems([]);
    }
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
          <Select onValueChange={setSelectedCheckType} defaultValue="ALL">
            <SelectTrigger className={`${isMobile ? "w-full" : "w-[180px]"}`}>
              <SelectValue placeholder="Filter by Check Type" />
            </SelectTrigger>
            <SelectContent>
              {checkTypes.map((type) => (
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
              onClick={handleDeleteItems}
              className="bg-red-700 hover:bg-red-600 w-full sm:w-auto"
            >
              Delete {selectedItems.length} items
            </Button>
          )}
          <CreateCheckButton
            isCreateItemModalOpen={isCreateItemModalOpen}
            setIsCreateItemModalOpen={setIsCreateItemModalOpen}
            isCreateItemLoading={isCreateItemLoading}
            handleCreateItemSubmit={handleCreateItemSubmit}
            isMobile={isMobile}
          />
        </div>
      </div>

      <div
        className={`relative ${isDeleteLoading ? "opacity-50" : "opacity-100"}`}
      >
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
                        onClick={() => handleShowDetails(item)}
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

        {isDeleteLoading && <DeleteOverlay />}
      </div>
    </div>
  );
};

export default CoreTable;
