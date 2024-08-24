import { createApiClient } from "./utils";
import { updateUserCheckCount } from "./users";

const API_URL = process.env.NEXT_PUBLIC_API_URL + "/checks";
const apiClient = createApiClient(API_URL);

interface Check {
  pk: string;
  sk: string;
  userid: string;
  [key: string]: any;
}

export async function fetchChecksByUser(
  userid: string
): Promise<Check[] | null> {
  return apiClient.get<Check[]>("", { params: { userid } });
}

export async function createCheck(
  checkItem: Omit<Check, "pk" | "sk">
): Promise<Check> {
  const newItem = await apiClient.post<Check>("", checkItem);
  await updateUserCheckCount(checkItem.userid, 1);
  return newItem;
}

export async function deleteCheck(
  checkItem: Pick<Check, "pk" | "sk" | "userid">
): Promise<void> {
  const { pk, sk, userid } = checkItem;
  await apiClient.delete("", { data: { pk, sk } });
  await updateUserCheckCount(userid, -1);
}

export async function updateCheck(
  checkItem: Pick<Check, "pk" | "sk" | "userid">,
  fields: Partial<Omit<Check, "pk" | "sk" | "userid">>
): Promise<void> {
  await apiClient.put("", { ...checkItem, ...fields });
}
