"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import CoreTable from "@/components/table/core-table";
import DynamicCheckForm from "@/components/items/item-form";
import { fetchData, addItem, deleteItem } from "@/lib/api/items";
import { Button } from "@/components/ui/button";
import { CheckItem } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
// import { Pagination } from "@/components/ui/pagination";
import { CustomPagination } from "@/components/table/custom-pagination";

function Home() {
  const { data: session, status } = useSession();
  const [data, setData] = useState<CheckItem[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isCreateItemLoading, setIsCreateItemLoading] = useState(false);
  const itemsPerPage = 10;

  useEffect(() => {
    if (status === "authenticated" && session?.user?.id) {
      fetchDataForUser(session.user.id);
    }
  }, [status, session]);

  async function fetchDataForUser(userid: string) {
    setIsDataLoading(true);
    console.log("Fetching data for user:", userid);

    const fetchedData = await fetchData(userid);
    if (fetchedData) {
      fetchedData.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setData(fetchedData);
      setIsDataLoading(false);
    }
  }

  const handleCreateItemSubmit = async (formData) => {
    try {
      console.log("Adding item:", formData);
      setIsCreateItemLoading(true);
      await addItem(formData);
      await fetchDataForUser(session.user.id);
      setIsCreateItemLoading(false);
      setIsFormDialogOpen(false);
    } catch (error) {
      setIsCreateItemLoading(false);
      console.error("Error adding item:", error);
    }
  };

  const handleDelete = async (items: CheckItem[]) => {
    console.log("Deleting items:", items);
    try {
      await Promise.all(items.map((item) => deleteItem(item.pk, item.sk)));
      fetchDataForUser(session.user.id);
    } catch (error) {
      console.error("Error deleting items:", error);
    }
  };

  const paginatedData = data.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="container mx-auto px-4">
      <h1 className="text-2xl font-bold mb-4">Check Management</h1>

      <div>
        <CoreTable
          data={paginatedData}
          handleDelete={handleDelete}
          isLoading={isDataLoading}
          handleCreateItemSubmit={handleCreateItemSubmit}
          isCreateItemLoading={isCreateItemLoading}
          isFormDialogOpen={isFormDialogOpen}
          setIsFormDialogOpen={setIsFormDialogOpen}
        />
        {data.length > 0 && (
          <div className="mt-4">
            <CustomPagination
              currentPage={currentPage}
              totalPages={Math.ceil(data.length / itemsPerPage)}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;
