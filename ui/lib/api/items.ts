import axios, { AxiosError } from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL_DEV + "/items";

export async function fetchData(userid: string) {
  console.log("Fetching data from", API_URL, "for user", userid);

  try {
    const response = await axios.get(API_URL!, {
      params: { userid: userid },
    });
    console.log("Data fetched successfully:", response.data);
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

type DynamoDBAttribute = {
  S?: string;
  N?: string;
  BOOL?: boolean;
  M?: { [key: string]: DynamoDBAttribute };
  L?: DynamoDBAttribute[];
  NULL?: boolean;
};

function convertDynamoDBAttribute(attribute: DynamoDBAttribute): any {
  if ("S" in attribute) {
    return attribute.S;
  } else if ("N" in attribute) {
    return Number(attribute.N);
  } else if ("BOOL" in attribute) {
    return attribute.BOOL;
  } else if ("M" in attribute) {
    const map: { [key: string]: any } = {};
    for (const key in attribute.M) {
      map[key] = convertDynamoDBAttribute(attribute.M[key]);
    }
    return map;
  } else if ("L" in attribute) {
    return attribute.L!.map((item) => convertDynamoDBAttribute(item));
  } else if ("NULL" in attribute) {
    return null;
  } else {
    throw new Error("Unsupported DynamoDB attribute type");
  }
}
