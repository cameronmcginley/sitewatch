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

const CoreTable = ({
  data,
  handleDelete,
  isLoading,
  handleCreateItemSubmit,
  isCreateItemLoading,
  isFormDialogOpen,
  setIsFormDialogOpen,
}) => {
  const [selectedCheckType, setSelectedCheckType] = useState("ALL");
  const [selectedItems, setSelectedItems] = useState<CheckItem[]>([]);
  // const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);

  const checkTypes = ["ALL", ...new Set(data.map((item) => item.check_type))];

  const columns =
    selectedCheckType === "ALL"
      ? getGenericColumns()
      : getTypeSpecificColumns(selectedCheckType);

  const filteredData =
    selectedCheckType === "ALL"
      ? data
      : data.filter((item: CheckItem) => item.check_type === selectedCheckType);

  const handleSelectItem = (item: CheckItem) => {
    setSelectedItems((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const handleDeleteItems = () => {
    handleDelete(selectedItems);
    setSelectedItems([]);
  };

  return (
    <>
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
            <Button onClick={handleDeleteItems} variant="destructive">
              Delete {selectedItems.length} items
            </Button>
          )}
          {/* Create button */}
          <Dialog
            open={isFormDialogOpen || isCreateItemLoading}
            onOpenChange={setIsFormDialogOpen}
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
                    color="#fff"
                    secondaryColor="#fff"
                    radius="12.5"
                    ariaLabel="mutating-dots-loading"
                    wrapperStyle={{}}
                    wrapperClass=""
                  />
                </div>
              ) : (
                <ItemForm onSubmit={handleCreateItemSubmit} />
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>

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
            : filteredData.map((item: CheckItem, index: number) => (
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
    </>
  );
};

export default CoreTable;
