import { addItem } from "@/lib/api/items";
import { dummyDataPlain } from "./dummydataPlain";

async function batchWriteData(data: any[]) {
  for (const item of data) {
    console.log("Adding item: ", item);
    try {
      const result = await addItem(item);
      console.log("Item added successfully", result);
    } catch (err) {
      console.error("Error adding item:", err);
      return;
    }
  }
}

export async function insertDummyData() {
  await batchWriteData(dummyDataPlain);
}
