import { DynamoDBClient, UpdateItemCommand } from "@aws-sdk/client-dynamodb";
import { getHeaders, getDynamoTableName } from "../utils/db.mjs";

const dynamoDb = new DynamoDBClient({ region: "us-east-2" });

export const handler = async (event) => {
  console.log("Received event:", JSON.stringify(event, null, 2));

  const headers = getHeaders();
  const item = JSON.parse(event.body || "{}");
  const userid = event.queryStringParameters?.userid;
  const { checkCountChange, ...attributes } = item;

  console.log("Parsed item:", JSON.stringify(item, null, 2));

  const tableName = await getDynamoTableName();
  console.log("DynamoDB table name:", tableName);

  let updateExpression = "SET ";
  const expressionAttributeNames = {};
  const expressionAttributeValues = {};

  // Handle regular attributes
  Object.keys(attributes).forEach((key, idx) => {
    updateExpression += `#attr${idx} = :val${idx}, `;
    expressionAttributeNames[`#attr${idx}`] = key;
    expressionAttributeValues[`:val${idx}`] = { S: String(attributes[key]) };
  });

  console.log("Update expression after regular attributes:", updateExpression);
  console.log(
    "ExpressionAttributeNames:",
    JSON.stringify(expressionAttributeNames, null, 2)
  );
  console.log(
    "ExpressionAttributeValues:",
    JSON.stringify(expressionAttributeValues, null, 2)
  );

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

  console.log("Final update expression:", updateExpression);

  const params = {
    TableName: tableName,
    Key: { pk: { S: `USER#${userid}` }, sk: { S: "PROFILE" } },
    UpdateExpression: updateExpression,
    ExpressionAttributeNames: expressionAttributeNames,
    ExpressionAttributeValues: expressionAttributeValues,
    ReturnValues: "UPDATED_NEW",
  };

  console.log("DynamoDB update params:", JSON.stringify(params, null, 2));

  try {
    const data = await dynamoDb.send(new UpdateItemCommand(params));
    console.log("Update succeeded:", JSON.stringify(data, null, 2));
    return {
      statusCode: 200,
      body: JSON.stringify({ message: "User updated successfully", data }),
      headers,
    };
  } catch (error) {
    console.error("Update failed:", error);
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
