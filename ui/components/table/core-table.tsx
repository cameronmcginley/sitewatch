import React, { use, useState } from "react";
import {
  Table,
  TableBody,
  TableCaption,
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

const CoreTable = ({ data, handleDelete, isLoading }) => {
  const [selectedCheckType, setSelectedCheckType] = useState("ALL");
  const [selectedItems, setSelectedItems] = useState<CheckItem[]>([]);
  const [filteredData, setFilteredData] = useState<CheckItem[]>(data);

  const checkTypes = ["ALL", ...new Set(data.map((item) => item.check_type))];

  const columns =
    selectedCheckType === "ALL"
      ? getGenericColumns()
      : getTypeSpecificColumns(selectedCheckType);

  React.useEffect(() => {
    setFilteredData(
      selectedCheckType === "ALL"
        ? data
        : data.filter(
            (item: CheckItem) => item.check_type === selectedCheckType
          )
    );
  }, [selectedCheckType, data]);

  const handleSelectItem = (item: CheckItem) => {
    setSelectedItems((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const handleDeleteItems = () => {
    handleDelete(selectedItems);
    setFilteredData((prevData) =>
      prevData.filter(
        (dataItem) =>
          !selectedItems.some(
            (item) => item.pk === dataItem.pk && item.sk === dataItem.sk
          )
      )
    );
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
            <Button
              onClick={handleDeleteItems}
              className=""
              variant="destructive"
            >
              Delete Selected
            </Button>
          )}
        </div>
      </div>

      <Table className="min-w-full divide-y divide-gray-200">
        <TableHeader>
          <TableRow>
            <TableHead>
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
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {isLoading
            ? // Show skeletons if data is loading
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Skeleton className="h-4 w-full" />
                  </TableCell>
                  {columns.map((_, colIndex) => (
                    <TableCell key={colIndex}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                  <TableCell className="w-0">
                    <Skeleton className="h-4 w-[100px]" />
                  </TableCell>
                </TableRow>
              ))
            : filteredData.map((item: CheckItem, index: number) => (
                <TableRow
                  key={item.pk ?? item.sk ?? index}
                  className="hover:bg-neutral-800"
                >
                  <TableCell>
                    <Checkbox
                      checked={selectedItems.includes(item)}
                      onCheckedChange={() => handleSelectItem(item)}
                    />
                  </TableCell>

                  {formatCells(item, columns)}

                  <TableCell className="w-0">
                    <Button onClick={() => handleShowDetails(item)}>
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
