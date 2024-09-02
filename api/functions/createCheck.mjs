import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { randomUUID } from "crypto";
import { Logger } from "@aws-lambda-powertools/logger";
import { getHeaders, getDynamoTableName } from "../utils/db.mjs";

const client = new DynamoDBClient({ region: "us-east-2" });
const dynamoDb = DynamoDBDocumentClient.from(client);
const logger = new Logger();

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

  logger.info("Inserting item", { item });

  const params = {
    TableName: tableName,
    Item: {
      pk: `CHECK#${randomUUID()}`,
      sk: item.sk || item.type || "CHECK",
      createdAt: createdAt,
      updatedAt: updatedAt,
      alias: item.alias,
      checkType: item.checkType,
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

  logger.info("Params being sent to DynamoDB", { params });

  try {
    await dynamoDb.send(new PutCommand(params));
    logger.info("Item added successfully", { params });
    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Item added successfully" }),
      headers,
    };
  } catch (error) {
    logger.error("Failed to add item", { error });
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
