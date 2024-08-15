"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import CoreTable from "@/components/table/core-table";
import { fetchData, addItem, deleteItem } from "@/lib/api/items";
import { CheckItem } from "@/lib/types";
import { CustomPagination } from "@/components/table/custom-pagination";
import { createItemFormSchema } from "@/components/items/schema";
import { z } from "zod";

function Home() {
  const { data: session, status } = useSession();
  const [data, setData] = useState<CheckItem[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [isCreateItemModalOpen, setIsCreateItemModalOpen] = useState(false);
  const [isCreateItemLoading, setIsCreateItemLoading] = useState(false);

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

  const handleCreateItemSubmit = async (
    values: z.infer<typeof createItemFormSchema>
  ) => {
    try {
      console.log("Adding item:", values);
      setIsCreateItemLoading(true);
      await addItem(values);
      await fetchDataForUser(session.user.id);
      setIsCreateItemLoading(false);
      setIsCreateItemModalOpen(false);
    } catch (error) {
      setIsCreateItemLoading(false);
      console.error("Error adding item:", error);
    }
  };

  const handleDelete = async (items: CheckItem[]) => {
    console.log("Deleting items:", items);
    try {
      await Promise.all(items.map((item) => deleteItem(item)));
      fetchDataForUser(session.user.id);
    } catch (error) {
      console.error("Error deleting items:", error);
    }
  };

  return (
    <div className="container mx-auto px-4">
      <h1 className="text-2xl font-bold mb-4">Check Management</h1>

      <div>
        <CoreTable
          data={data}
          handleDelete={handleDelete}
          isLoading={isDataLoading}
          handleCreateItemSubmit={handleCreateItemSubmit}
          isCreateItemLoading={isCreateItemLoading}
          isCreateItemModalOpen={isCreateItemModalOpen}
          setIsCreateItemModalOpen={setIsCreateItemModalOpen}
        />
      </div>
    </div>
  );
}

export default Home;
