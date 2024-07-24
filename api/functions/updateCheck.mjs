import { DynamoDBClient, UpdateItemCommand } from "@aws-sdk/client-dynamodb";
import { getHeaders, getDynamoTableName } from "../utils/db.mjs";

const dynamoDb = new DynamoDBClient({ region: "us-east-2" });

export const handler = async (event) => {
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
      acc[`:val${idx}`] = { S: String(attributes[key]) };
      return acc;
    },
    {}
  );

  const params = {
    TableName: tableName,
    Key: { pk: { S: pk }, sk: { S: sk } },
    UpdateExpression: updateExpression,
    ExpressionAttributeNames: expressionAttributeNames,
    ExpressionAttributeValues: expressionAttributeValues,
    ReturnValues: "UPDATED_NEW",
  };

  try {
    const data = await dynamoDb.send(new UpdateItemCommand(params));
    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Item updated successfully", data }),
      headers,
    };
  } catch (error) {
    console.error(error);
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
