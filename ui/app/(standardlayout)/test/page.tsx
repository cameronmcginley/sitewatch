"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import CoreTable from "@/components/table/core-table";
import DynamicCheckForm from "@/components/items/item-form";
import { fetchData, addItem, deleteItem } from "@/lib/api/items";
import { Checkbox } from "@/components/ui/checkbox";

import { generateDummyData } from "@/data/generateDummyData";

import { dummyData } from "@/data/dummyData";
import { insertDummyData } from "@/data/insertDummyData";
import { Button } from "@/components/ui/button";
import { CheckItem } from "@/lib/types";
import { set } from "date-fns";

function Home() {
  const { data: session, status } = useSession();
  const [data, setData] = useState([]);
  const [showRealData, setShowRealData] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(true);

  useEffect(() => {
    if (status === "authenticated" && session?.user?.id) {
      fetchDataForUser(session.user.id);
    }
    // console.log(generateDummyData(30));
  }, [status, session]);

  async function fetchDataForUser(userid: string) {
    setIsDataLoading(true);

    console.log("Fetching data for user:", userid);

    const fetchedData = await fetchData(userid);
    if (fetchedData) {
      // Sort by data.createdAt
      fetchedData.sort((a, b) => {
        return new Date(b.createdAt) - new Date(a.createdAt);
      });

      setData(fetchedData);
      setIsDataLoading(false);
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

  const handleDelete = async (items: CheckItem[]) => {
    console.log("Deleting items:", items);

    try {
      await Promise.all(items.map((item) => deleteItem(item.pk, item.sk)));
    } catch (error) {
      console.error("Error deleting items:", error);
    }
  };

  return (
    <div className="container mx-auto px-4">
      <h1 className="text-2xl font-bold mb-4">Check Management</h1>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Add New Check</h2>
        <DynamicCheckForm onSubmit={handleFormSubmit} />
      </div>

      <div className="flex flex-row gap-2 items-center p-4">
        <Checkbox
          onClick={() => {
            setShowRealData(!showRealData);
            console.log("Show real data:", showRealData);
          }}
        />
        <p>Show real data</p>
      </div>

      <div className="p-4 gap-2 flex flex-col">
        <p>Insert dummy data to DDB</p>
        <Button onClick={insertDummyData}>Insert Dummy Data</Button>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-2">Existing Checks</h2>
        <CoreTable
          // data={showRealData ? data : dummyData}
          data={data}
          handleDelete={handleDelete}
          isLoading={isDataLoading}
        />
      </div>
    </div>
  );
}

export default Home;
