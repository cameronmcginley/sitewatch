import { DynamoDBClient, UpdateItemCommand } from "@aws-sdk/client-dynamodb";
import { getHeaders, getDynamoTableName } from "../utils/db.mjs";

const dynamoDb = new DynamoDBClient({ region: "us-east-2" });

export const handler = async (event) => {
  const headers = getHeaders();
  const item = JSON.parse(event.body || "{}");
  const { userId, checkCountChange, ...attributes } = item;

  const tableName = await getDynamoTableName();

  let updateExpression = "SET ";
  const expressionAttributeNames = {};
  const expressionAttributeValues = {};

  // Handle regular attributes
  Object.keys(attributes).forEach((key, idx) => {
    updateExpression += `#attr${idx} = :val${idx}, `;
    expressionAttributeNames[`#attr${idx}`] = key;
    expressionAttributeValues[`:val${idx}`] = { S: String(attributes[key]) };
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

  const params = {
    TableName: tableName,
    Key: { pk: { S: `USER#${userId}` }, sk: { S: "PROFILE" } },
    UpdateExpression: updateExpression,
    ExpressionAttributeNames: expressionAttributeNames,
    ExpressionAttributeValues: expressionAttributeValues,
    ReturnValues: "UPDATED_NEW",
  };

  try {
    const data = await dynamoDb.send(new UpdateItemCommand(params));
    return {
      statusCode: 200,
      body: JSON.stringify({ message: "User updated successfully", data }),
      headers,
    };
  } catch (error) {
    console.error(error);
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
