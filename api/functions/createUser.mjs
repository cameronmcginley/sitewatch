import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { randomUUID } from "crypto";
import { getHeaders, getDynamoTableName } from "../utils/db.mjs";

const client = new DynamoDBClient({ region: "us-east-2" });
const dynamoDb = DynamoDBDocumentClient.from(client);

/**
 * Lambda handler to create a new check item.
 * @param {Object} event - The event object containing request data.
 * @returns {Object} Response object with status code and body.
 */
export const handler = async (event) => {
  const headers = getHeaders();
  const user = JSON.parse(event.body || "{}");

  const tableName = await getDynamoTableName();

  console.log("Inserting user:", user);

  const params = {
    TableName: tableName,
    Item: {
      pk: `USER#${user.id}`,
      sk: "PROFILE",
      createdAt: user.createdAt,
      id: user.id,
      email: user.email,
      name: user.name,
      userType: user.userType,
      provider: user.provider,
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
      body: JSON.stringify({ message: "User added successfully" }),
      headers,
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Failed to add user",
        error: error.message,
      }),
      headers,
    };
  }
};
