"use client";

import React, { useEffect, useState } from "react";
import axios, { AxiosError } from "axios";
import { useSession } from "next-auth/react";
import CoreTable from "@/components/core-table";
import dummyData from "@/data/dummyData.json";

const API_URL = process.env.NEXT_PUBLIC_API_URL_ITEMS;

function Home() {
  const { data: session, status } = useSession();
  const [data, setData] = useState([]);
  const [item, setItem] = useState({
    userid: "",
    type: "CHECK",
    check_type: "",
    url: "",
    alias: "",
    keyword: "",
    opposite: false,
  });

  async function fetchData(userid: string) {
    console.log("Fetching data from", API_URL, "for user", userid);

    try {
      const response = await axios.get(API_URL!, {
        params: { userid: userid },
      });
      setData(response.data);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        if (axiosError.response?.status === 404) {
          console.log("No data found for user:", userid);
          setData([]);
          return null;
        } else {
          console.error("Error fetching data:", axiosError.message);
          throw error;
        }
      } else {
        console.error("Unexpected error:", error);
        throw error;
      }
    }
  }

  useEffect(() => {
    console.log("status", status, "session", session);
    if (status === "authenticated" && session?.user?.id) {
      setItem((prevItem) => ({
        ...prevItem,
        userid: session.user.id,
      }));
      fetchData(session.user.id);
    }
  }, [status, session]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setItem((prevItem) => ({
      ...prevItem,
      [name]: value,
    }));
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setItem((prevItem) => ({
      ...prevItem,
      [name]: checked,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await axios.post(API_URL, item);
      setItem({
        userid: session.user.id,
        type: "CHECK",
        check_type: "",
        url: "",
        alias: "",
        keyword: "",
        opposite: false,
      });
      // Fetch updated data
      fetchData(session.user.id);
    } catch (error) {
      console.error("Error adding item:", error);
    }
  };

  const handleDelete = async (pk, sk) => {
    try {
      await axios.delete(API_URL, { data: { pk, sk } });
      // Fetch updated data
      fetchData(session.user.id);
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };

  return (
    <>
      <CoreTable data={dummyData} />
      <h1 className="text-2xl font-bold">My Homepage</h1>
      <p className="mt-4">Welcome to my homepage!</p>
      <form onSubmit={handleSubmit} className="mt-8">
        <input
          type="text"
          name="check_type"
          value={item.check_type}
          onChange={handleChange}
          placeholder="Check Type"
          required
          className="border p-2 mb-2"
        />
        <input
          type="text"
          name="url"
          value={item.url}
          onChange={handleChange}
          placeholder="URL"
          required
          className="border p-2 mb-2"
        />
        <input
          type="text"
          name="alias"
          value={item.alias}
          onChange={handleChange}
          placeholder="Alias"
          required
          className="border p-2 mb-2"
        />
        <input
          type="text"
          name="keyword"
          value={item.keyword}
          onChange={handleChange}
          placeholder="Keyword"
          required
          className="border p-2 mb-2"
        />
        <label className="block mb-2">
          Opposite:
          <input
            type="checkbox"
            name="opposite"
            checked={item.opposite}
            onChange={handleCheckboxChange}
            className="ml-2"
          />
        </label>
        <button type="submit" className="bg-blue-500 text-white p-2">
          Submit
        </button>
      </form>
      <ul className="mt-8">
        {data.map((item, index) => (
          <li key={index} className="border p-2 mb-2">
            {item.alias.S}: {item.url.S} - {item.keyword.S}
            <button
              onClick={() => handleDelete(item.pk.S, item.sk.S)}
              className="bg-red-500 text-white p-1 ml-2"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </>
  );
}

export default Home;
