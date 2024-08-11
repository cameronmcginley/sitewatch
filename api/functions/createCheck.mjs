import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { randomUUID } from "crypto";
import {
  getHeaders,
  getDynamoTableName,
  formatDynamoDBItem,
} from "../utils/db.mjs";

const client = new DynamoDBClient({ region: "us-east-2" });
const dynamoDb = DynamoDBDocumentClient.from(client);

/**
 * Lambda handler to create a new check item.
 * @param {Object} event - The event object containing request data.
 * @returns {Object} Response object with status code and body.
 */
export const handler = async (event) => {
  const headers = getHeaders();
  const item = JSON.parse(event.body || "{}");

  const now = new Date().toISOString();

  // Passed in for dummy data
  const createdAt = item.createdAt || now;
  const updatedAt = item.updatedAt || now;
  // Delete these so they don't get added to the item
  delete item.createdAt;
  delete item.updatedAt;

  const tableName = await getDynamoTableName();

  console.log("Inserting item:", item);

  const params = {
    TableName: tableName,
    Item: {
      pk: `CHECK#${randomUUID()}`,
      sk: item.sk || item.type || "CHECK",
      createdAt: createdAt,
      updatedAt: updatedAt,
      alias: item.alias,
      check_type: item.check_type,
      url: item.url,
      userid: item.userid,
      lastResult: item.lastResult,
      status: item.status,
      delayMs: item.delayMs,
      attributes: item.attributes,
      email: item.email,
      mostRecentAlert: item.mostRecentAlert,
      cron: item.cron,
      useProxy: item.useProxy,
    },
  };

  console.log(
    "Params being sent to DynamoDB:",
    JSON.stringify(params, null, 2)
  );

  try {
    await dynamoDb.send(new PutCommand(params));
    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Item added successfully" }),
      headers,
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Failed to add item",
        error: error.message,
      }),
      headers,
    };
  }
};
