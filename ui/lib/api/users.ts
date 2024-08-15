// usersApi.ts

import { createApiClient } from "./utils";

const API_URL = process.env.NEXT_PUBLIC_API_URL_DEV + "/users";
const apiClient = createApiClient(API_URL);

export interface User {
  id: string;
  name: string;
  email: string;
  checkCount: number;
  [key: string]: any;
}

export interface UserUpdates {
  name?: string;
  email?: string;
  checkCountChange?: number;
  [key: string]: any;
}

export async function fetchUser(userId: string): Promise<User | null> {
  return apiClient.get<User>(`?userid=${userId}`);
}

export async function createUser(
  user: Omit<User, "id" | "checkCount">
): Promise<User> {
  return apiClient.post<User>("", user);
}

export async function updateUser(
  userId: string,
  updates: UserUpdates
): Promise<User> {
  return apiClient.put<User>(`?userid=${userId}`, updates);
}

export async function updateUserCheckCount(
  userId: string,
  change: number
): Promise<User> {
  return updateUser(userId, { checkCountChange: change });
}

export async function deleteUser(userId: string): Promise<void> {
  return apiClient.delete(`?userid=${userId}`);
}
