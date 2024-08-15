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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import ItemForm from "@/components/items/item-form";
import { MutatingDots } from "react-loader-spinner";
import { CustomPagination } from "./custom-pagination";
import DeleteOverlay from "./delete-overlay";

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

  return (
    <div className="relative">
      <div className="flex flex-row mb-4 justify-between">
        <div className="flex flex-row gap-2">
          {/* Select CheckType to show */}
          <Select onValueChange={setSelectedCheckType} defaultValue="ALL">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by Check Type" />
            </SelectTrigger>
            <SelectContent>
              {checkTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-row gap-2">
          {/* Delete button */}
          {selectedItems.length > 0 && (
            <Button
              onClick={handleDeleteItems}
              className="bg-red-700 hover:bg-red-600"
            >
              Delete {selectedItems.length} items
            </Button>
          )}
          {/* Create button */}
          <Dialog
            open={isCreateItemModalOpen || isCreateItemLoading}
            onOpenChange={setIsCreateItemModalOpen}
          >
            <DialogTrigger asChild>
              <Button className="mb-4">Create Check</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {isCreateItemLoading
                    ? "Creating Item..."
                    : "Create New Check"}
                </DialogTitle>
              </DialogHeader>
              {isCreateItemLoading ? (
                <div className="flex flex-col justify-center items-center">
                  <MutatingDots
                    height="100"
                    width="100"
                    color="#000"
                    secondaryColor="#000"
                    radius="12.5"
                    ariaLabel="mutating-dots-loading"
                    wrapperStyle={{}}
                    wrapperClass=""
                  />
                </div>
              ) : (
                <ItemForm handleCreateItemSubmit={handleCreateItemSubmit} />
              )}
            </DialogContent>
          </Dialog>
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
