"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import CoreTable from "@/components/checks/table/CoreTable";
import { fetchChecksByUser, createCheck, deleteCheck } from "@/lib/api/checks";
import { CheckItem } from "@/lib/types";
import { createCheckFormSchema } from "@/lib/checks/schema";
import { z } from "zod";
import { USER_TYPE_TO_LIMITS } from "@/lib/constants";
import { fetchUser } from "@/lib/api/users";
import { DeleteConfirmation } from "@/components/checks/DeleteConfirmation";
import { LoadingOverlay } from "@/components/checks/LoadingOverlay";

function Home() {
  const { data: session, status } = useSession();
  const [data, setData] = useState<CheckItem[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [isCreateItemModalOpen, setIsCreateItemModalOpen] = useState(false);
  const [isCreateItemLoading, setIsCreateItemLoading] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemsToDelete, setItemsToDelete] = useState<CheckItem[]>([]);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);

  useEffect(() => {
    if (status === "authenticated" && session.user.id) {
      fetchDataForUser(session.user.id);
    }
  }, [status, session]);

  async function fetchDataForUser(userid: string) {
    setIsDataLoading(true);
    console.log("Fetching data for user:", userid);

    const fetchedData = await fetchChecksByUser(userid);
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
    values: z.infer<typeof createCheckFormSchema>
  ) => {
    console.log("Adding item:", values);
    setIsCreateItemLoading(true);
    setIsCreateItemModalOpen(false);

    // Check for user's limit first
    const userLimit = USER_TYPE_TO_LIMITS[session.user.userType];
    const userData = await fetchUser(session.user.id);
    const currentCount = userData?.[0]?.checkCount || 0;

    console.log("Current count:", currentCount, "User limit:", userLimit);

    if (currentCount >= userLimit) {
      setIsCreateItemLoading(false);
      alert(
        `You have reached your limit of ${userLimit} checks. Please delete some checks to add more.`
      );
      return;
    }

    try {
      await createCheck(values);
      await fetchDataForUser(session.user.id);
    } catch (error) {
      setIsCreateItemLoading(false);
      console.error("Error adding item:", error);
    } finally {
      setIsCreateItemLoading(false);
    }
  };

  const deleteCheckItems = async (items: CheckItem[]) => {
    console.log("Deleting items:", items);
    setIsDeleteLoading(true);
    setIsDeleteModalOpen(false);
    try {
      await Promise.all(items.map((item) => deleteCheck(item)));
      fetchDataForUser(session.user.id);
    } catch (error) {
      console.error("Error deleting items:", error);
    } finally {
      setItemsToDelete([]);
      setIsDeleteLoading(false);
    }
  };

  const handleDelete = async (items: CheckItem[]) => {
    console.log("handleDelete", items);
    setItemsToDelete(items);
    setIsDeleteModalOpen(true);
  };

  return (
    <>
      <div className="container mx-auto px-4">
        <h1 className="text-2xl font-bold mb-4 text-center text-muted-foreground">
          URL Monitor Configuration
        </h1>

        <div>
          <CoreTable
            data={data}
            handleDelete={handleDelete}
            isLoading={isDataLoading}
            handleCreateItemSubmit={handleCreateItemSubmit}
            isCreateItemModalOpen={isCreateItemModalOpen}
            setIsCreateItemModalOpen={setIsCreateItemModalOpen}
            fetchDataForUser={fetchDataForUser}
          />
        </div>
      </div>

      <DeleteConfirmation
        isOpen={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        handleDelete={() => deleteCheckItems(itemsToDelete)}
      />

      {isCreateItemLoading && (
        <LoadingOverlay
          mainText="Creating..."
          subText="Please wait while we create your check."
        />
      )}

      {isDeleteLoading && (
        <LoadingOverlay
          mainText="Deleting..."
          subText="Please wait while we remove the selected item."
        />
      )}
    </>
  );
}

export default Home;
