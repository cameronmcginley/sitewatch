"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import CoreTable from "@/components/table/core-table";
import DynamicCheckForm from "@/components/items/item-form";
import { fetchData, addItem, deleteItem } from "@/lib/api/items";

import { generateDummyData } from "@/data/generateDummyData";

import dummyData from "@/data/dummyData";

function Home() {
  const { data: session, status } = useSession();
  const [data, setData] = useState([]);

  useEffect(() => {
    if (status === "authenticated" && session?.user?.id) {
      fetchDataForUser(session.user.id);
    }
    console.log(generateDummyData(30));
  }, [status, session]);

  async function fetchDataForUser(userid: string) {
    const fetchedData = await fetchData(userid);
    if (fetchedData) {
      setData(fetchedData);
    }
  }

  const handleFormSubmit = async (formData) => {
    try {
      await addItem(formData);
      // Fetch updated data
      fetchDataForUser(session.user.id);
    } catch (error) {
      console.error("Error adding item:", error);
    }
  };

  const handleDelete = async (pk, sk) => {
    try {
      await deleteItem(pk, sk);
      // Fetch updated data
      fetchDataForUser(session.user.id);
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };

  return (
    <div className="container mx-auto px-4">
      <h1 className="text-2xl font-bold mb-4">Check Management</h1>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Add New Check</h2>
        <DynamicCheckForm onSubmit={handleFormSubmit} />
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-2">Existing Checks</h2>
        <CoreTable data={dummyData} onDelete={handleDelete} />
      </div>
    </div>
  );
}

export default Home;
