import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { Logger } from "@aws-lambda-powertools/logger";
import { getHeaders, getDynamoTableName } from "../utils/db.mjs";

const dynamoDb = new DynamoDBClient({ region: "us-east-2" });
const ddbDocClient = DynamoDBDocumentClient.from(dynamoDb);
const logger = new Logger();

export const handler = async (event) => {
  logger.info("Received event", { event });

  const headers = getHeaders();
  const item = JSON.parse(event.body || "{}");
  const { pk, sk, ...attributes } = item;

  const tableName = await getDynamoTableName();

  const updateExpression =
    "SET " +
    Object.keys(attributes)
      .map((key, idx) => `#attr${idx} = :val${idx}`)
      .join(", ");

  const expressionAttributeNames = Object.keys(attributes).reduce(
    (acc, key, idx) => {
      acc[`#attr${idx}`] = key;
      return acc;
    },
    {}
  );

  const expressionAttributeValues = Object.keys(attributes).reduce(
    (acc, key, idx) => {
      acc[`:val${idx}`] = attributes[key];
      return acc;
    },
    {}
  );

  const params = {
    TableName: tableName,
    Key: { pk, sk },
    UpdateExpression: updateExpression,
    ExpressionAttributeNames: expressionAttributeNames,
    ExpressionAttributeValues: expressionAttributeValues,
    ReturnValues: "UPDATED_NEW",
  };

  try {
    const data = await ddbDocClient.send(new UpdateCommand(params));
    logger.info("Item updated successfully", { params, data });
    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Item updated successfully", data }),
      headers,
    };
  } catch (error) {
    logger.error("Failed to update item", { error });
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Failed to update item",
        error: error.message,
      }),
      headers,
    };
  }
};
