import { DynamoDBClient, DeleteItemCommand } from "@aws-sdk/client-dynamodb";
import { getHeaders, getDynamoTableName } from "../utils/db.mjs";

const dynamoDb = new DynamoDBClient({ region: "us-east-2" });

export const handler = async (event) => {
  const headers = getHeaders();
  const { pk, sk } = JSON.parse(event.body || "{}");

  const tableName = await getDynamoTableName();

  const params = {
    TableName: tableName,
    Key: { pk: { S: pk }, sk: { S: sk } },
  };

  try {
    await dynamoDb.send(new DeleteItemCommand(params));
    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Item deleted successfully" }),
      headers,
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Failed to delete item",
        error: error.message,
      }),
      headers,
    };
  }
};
