import React, { useState } from "react";
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
import {
  formatCells,
  getGenericColumns,
  getTypeSpecificColumns,
} from "./cell-formatters";
import { handleShowDetails } from "./utils";

const CoreTable = ({ data }) => {
  const [selectedCheckType, setSelectedCheckType] = useState("ALL");

  const checkTypes = [
    "ALL",
    ...new Set(data.map((item) => item.check_type?.S)),
  ];

  const columns =
    selectedCheckType === "ALL"
      ? getGenericColumns()
      : getTypeSpecificColumns(selectedCheckType);

  const filteredData =
    selectedCheckType === "ALL"
      ? data
      : data.filter((item) => item.check_type?.S === selectedCheckType);

  return (
    <>
      <div className="mb-4">
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

      <Table className="min-w-full divide-y divide-gray-200">
        {/* <TableCaption>A list of your recent checks.</TableCaption> */}

        <TableHeader>
          <TableRow>
            <TableHead>
              <Checkbox />
            </TableHead>
            {columns.map((column, index) => (
              <TableHead key={index}>{column.header}</TableHead>
            ))}
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {filteredData.map((item, index) => (
            <TableRow
              key={item.pk?.S ?? item.sk?.S ?? index}
              className="hover:bg-neutral-800"
            >
              <TableCell>
                <Checkbox />
              </TableCell>

              {formatCells(item, columns)}

              <TableCell className="w-0">
                <Button onClick={() => handleShowDetails(item)}>Details</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
};

export default CoreTable;
