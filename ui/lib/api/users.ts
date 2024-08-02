import axios, { AxiosError } from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL_DEV + "/users";

export async function fetchUser(userid: string) {
  console.log("Fetching user from", API_URL, "for user ID", userid);

  try {
    const response = await axios.get(API_URL!, {
      params: { userid: userid },
    });
    console.log("User fetched successfully:", response.data);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      if (axiosError.response?.status === 404) {
        console.log("No user found for user ID:", userid);
        return null;
      } else {
        console.error("Error fetching user:", axiosError.message);
        throw error;
      }
    } else {
      console.error("Unexpected error:", error);
      throw error;
    }
  }
}

export async function createUser(user: any) {
  try {
    const response = await axios.post(API_URL!, user);
    return response.data;
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
}

// export async function updateUser(userId: string, updates: any) {
//   try {
//     const response = await axios.put(API_URL!, { userId, updates });
//     return response.data;
//   } catch (error) {
//     console.error("Error updating user:", error);
//     throw error;
//   }
// }
