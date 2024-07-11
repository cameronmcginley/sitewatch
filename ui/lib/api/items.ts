import axios, { AxiosError } from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL_ITEMS + "/items";

export async function fetchData(userid: string) {
  console.log("Fetching data from", API_URL, "for user", userid);

  try {
    const response = await axios.get(API_URL!, {
      params: { userid: userid },
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      if (axiosError.response?.status === 404) {
        console.log("No data found for user:", userid);
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

export async function addItem(item: any) {
  try {
    const response = await axios.post(API_URL!, item);
    return response.data;
  } catch (error) {
    console.error("Error adding item:", error);
    throw error;
  }
}

export async function deleteItem(pk: string, sk: string) {
  try {
    const response = await axios.delete(API_URL!, { data: { pk, sk } });
    return response.data;
  } catch (error) {
    console.error("Error deleting item:", error);
    throw error;
  }
}