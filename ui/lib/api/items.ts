import { createApiClient } from "./utils";
import { updateUserCheckCount } from "./users";

const API_URL = process.env.NEXT_PUBLIC_API_URL + "/items";
const apiClient = createApiClient(API_URL);

interface Item {
  pk: string;
  sk: string;
  userid: string;
  [key: string]: any;
}

export async function fetchData(userid: string): Promise<Item[] | null> {
  return apiClient.get<Item[]>("", { params: { userid } });
}

export async function addItem(item: Omit<Item, "pk" | "sk">): Promise<Item> {
  const newItem = await apiClient.post<Item>("", item);
  await updateUserCheckCount(item.userid, 1);
  return newItem;
}

export async function deleteItem(
  item: Pick<Item, "pk" | "sk" | "userid">
): Promise<void> {
  const { pk, sk, userid } = item;
  await apiClient.delete("", { data: { pk, sk } });
  await updateUserCheckCount(userid, -1);
}

export async function updateItem(
  item: Pick<Item, "pk" | "sk" | "userid">,
  fields: Partial<Omit<Item, "pk" | "sk" | "userid">>
): Promise<void> {
  await apiClient.put("", { ...item, ...fields });
}
