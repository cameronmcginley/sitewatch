"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL_ITEMS;

export default function Home() {
  const [data, setData] = useState([]);
  const [item, setItem] = useState({
    type: "",
    url: "",
    alias: "",
    keyword: "",
    opposite: false,
  });

  useEffect(() => {
    // Fetch data on component mount
    const fetchData = async () => {
      try {
        const response = await axios.get(API_URL);
        setData(response.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

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
      setItem({ type: "", url: "", alias: "", keyword: "", opposite: false });
      // Fetch updated data
      const response = await axios.get(API_URL);
      setData(response.data);
    } catch (error) {
      console.error("Error adding item:", error);
    }
  };

  const handleDelete = async (pk, sk) => {
    try {
      await axios.delete(API_URL, { data: { pk, sk } });
      // Fetch updated data
      const response = await axios.get(API_URL);
      setData(response.data);
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };

  return (
    <>
      <h1 className="text-2xl font-bold">My Homepage</h1>
      <p className="mt-4">Welcome to my homepage!</p>
      <form onSubmit={handleSubmit} className="mt-8">
        <input
          type="text"
          name="type"
          value={item.type}
          onChange={handleChange}
          placeholder="Type"
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
