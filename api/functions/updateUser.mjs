import { DynamoDBClient, UpdateItemCommand } from "@aws-sdk/client-dynamodb";
import { Logger } from "@aws-lambda-powertools/logger";
import { getHeaders, getDynamoTableName } from "../utils/db.mjs";

const dynamoDb = new DynamoDBClient({ region: "us-east-2" });
const logger = new Logger();

export const handler = async (event) => {
  logger.info("Received event", { event });

  const headers = getHeaders();
  const item = JSON.parse(event.body || "{}");
  const userid = event.queryStringParameters?.userid;
  const { checkCountChange, ...attributes } = item;

  logger.info("Parsed item", { item });

  const tableName = await getDynamoTableName();
  logger.info("DynamoDB table name", { tableName });

  let updateExpression = "SET ";
  const expressionAttributeNames = {};
  const expressionAttributeValues = {};

  // Handle regular attributes
  Object.keys(attributes).forEach((key, idx) => {
    updateExpression += `#attr${idx} = :val${idx}, `;
    expressionAttributeNames[`#attr${idx}`] = key;
    expressionAttributeValues[`:val${idx}`] = { S: String(attributes[key]) };
  });

  logger.info("Update expression after regular attributes", {
    updateExpression,
    expressionAttributeNames,
    expressionAttributeValues,
  });

  // Handle checkCount increment/decrement
  if (checkCountChange !== undefined) {
    updateExpression +=
      "#checkCount = if_not_exists(#checkCount, :zero) + :checkCountChange";
    expressionAttributeNames["#checkCount"] = "checkCount";
    expressionAttributeValues[":checkCountChange"] = {
      N: String(checkCountChange),
    };
    expressionAttributeValues[":zero"] = { N: "0" };
  } else {
    // Remove trailing comma and space if no checkCount update
    updateExpression = updateExpression.slice(0, -2);
  }

  logger.info("Final update expression", { updateExpression });

  const params = {
    TableName: tableName,
    Key: { pk: { S: `USER#${userid}` }, sk: { S: "PROFILE" } },
    UpdateExpression: updateExpression,
    ExpressionAttributeNames: expressionAttributeNames,
    ExpressionAttributeValues: expressionAttributeValues,
    ReturnValues: "UPDATED_NEW",
  };

  logger.info("DynamoDB update params", { params });

  try {
    const data = await dynamoDb.send(new UpdateItemCommand(params));
    logger.info("Update succeeded", { data });
    return {
      statusCode: 200,
      body: JSON.stringify({ message: "User updated successfully", data }),
      headers,
    };
  } catch (error) {
    logger.error("Update failed", { error });
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Failed to update user",
        error: error.message,
      }),
      headers,
    };
  }
};
