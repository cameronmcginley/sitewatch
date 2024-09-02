import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { Logger } from "@aws-lambda-powertools/logger";
import { getHeaders, getDynamoTableName } from "../utils/db.mjs";

const client = new DynamoDBClient({ region: "us-east-2" });
const dynamoDb = DynamoDBDocumentClient.from(client);
const logger = new Logger();

export const handler = async (event) => {
  const headers = getHeaders();
  const user = JSON.parse(event.body || "{}");

  const tableName = await getDynamoTableName();

  logger.info("Inserting user", { user });

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

  logger.info("Params being sent to DynamoDB", { params });

  try {
    await dynamoDb.send(new PutCommand(params));
    logger.info("User added successfully", { params });
    return {
      statusCode: 200,
      body: JSON.stringify({ message: "User added successfully" }),
      headers,
    };
  } catch (error) {
    logger.error("Failed to add user", { error });
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
